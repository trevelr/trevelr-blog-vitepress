<script setup lang="ts">
import { ref } from 'vue'

type PageModule = {
  __pageData?: {
    relativePath?: string
    frontmatter?: Record<string, any>
    title?: string
    description?: string
    lastUpdated?: string
  }
}

const modules = import.meta.glob('/blog/*.md', { eager: true }) as Record<string, PageModule>

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Latest posts
const latestPosts = Object.values(modules)
  .map(mod => {
    const pageData = mod.__pageData || {}
    const fm = pageData.frontmatter || {}
    if (pageData.relativePath === 'blog/index.md') return null
    const slug = pageData.relativePath
      ? pageData.relativePath.replace(/^blog\//, '').replace(/\.md$/, '')
      : ''
    if (!slug) return null
    return {
      title: (fm.title || pageData.title || slug) as string,
      date: (fm.date || '') as string,
      link: `/blog/${slug}`
    }
  })
  .filter(Boolean)
  .sort((a, b) => (a!.date < b!.date ? 1 : -1))
  .slice(0, 4) as { title: string; date: string; link: string }[]

// Archive data
const categoryMap = new Map<string, { name: string; slug: string; count: number }>()
const tagMap = new Map<string, { name: string; slug: string; count: number }>()
const yearMap = new Map<
  string,
  { year: string; total: number; months: Map<string, { month: string; label: string; count: number }> }
>()

Object.values(modules).forEach((mod) => {
  const pageData = mod.__pageData || {}
  const fm = pageData.frontmatter || {}

  const catList = Array.isArray(fm.categories)
    ? fm.categories
    : fm.category
      ? [fm.category]
      : []
  catList.forEach((cat: string) => {
    const name = String(cat)
    const slug = slugify(name)
    const existing = categoryMap.get(slug)
    if (existing) existing.count += 1
    else categoryMap.set(slug, { name, slug, count: 1 })
  })

  const tagList = Array.isArray(fm.tags) ? fm.tags : fm.tags ? [fm.tags] : []
  tagList.forEach((tag: string) => {
    const name = String(tag)
    const slug = slugify(name)
    const existing = tagMap.get(slug)
    if (existing) existing.count += 1
    else tagMap.set(slug, { name, slug, count: 1 })
  })

  const dateStr: string | undefined = fm.date || pageData.lastUpdated
  if (!dateStr) return
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return

  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const label = date.toLocaleString('default', { month: 'long' })

  const yearEntry =
    yearMap.get(year) ||
    (() => {
      const entry = { year, total: 0, months: new Map<string, { month: string; label: string; count: number }>() }
      yearMap.set(year, entry)
      return entry
    })()

  yearEntry.total += 1
  const monthEntry = yearEntry.months.get(month) || { month, label, count: 0 }
  monthEntry.count += 1
  yearEntry.months.set(month, monthEntry)
})

const categories = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name))
const tags = Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name))
const archives = Array.from(yearMap.values())
  .map((year) => ({
    year: year.year,
    total: year.total,
    months: Array.from(year.months.values()).sort((a, b) => a.month.localeCompare(b.month))
  }))
  .sort((a, b) => Number(b.year) - Number(a.year))

// Dropdown state
const showCategories = ref(true)
const showTags = ref(true)
const showDates = ref(false)
</script>

<template>
  <aside class="sidebar">

    <div class="sidebar-newsletter sidebar-card">
      <h3 class="sidebar-card-title">Subscribe</h3>
      <form action="#" method="post" class="sidebar-form">
        <input
          type="email"
          name="email"
          placeholder="Your email"
          required
          class="sidebar-input"
        />
        <button type="submit" class="sidebar-button">Join</button>
      </form>
    </div>

    <div class="sidebar-advertisement sidebar-card">
      <h3 class="sidebar-card-title">Sponsored</h3>
      <img
        src="/assets/img/sunset.jpeg"
        alt="Ad banner"
        class="sidebar-ad-image"
      />
    </div>

    <div class="sidebar-card" v-if="latestPosts.length">
      <h3 class="sidebar-card-title">Latest</h3>
      <ul class="sidebar-link-list">
        <li v-for="post in latestPosts" :key="post.link" class="sidebar-link-item">
          <a :href="post.link">{{ post.title }}</a>
        </li>
      </ul>
    </div>

    <div class="sidebar-archives sidebar-card">
      <h3 class="sidebar-card-title">Archive</h3>

      <div class="sidebar-section">
        <button class="sidebar-section-toggle" @click="showCategories = !showCategories">
          Categories
          <span class="toggle-icon" :class="{ open: showCategories }">▾</span>
        </button>
        <div v-show="showCategories" class="sidebar-section-content sidebar-tag-cloud">
          <a
            v-for="cat in categories"
            :key="cat.slug"
            :href="`/category/${cat.slug}/`"
            class="badge badge-category"
          >{{ cat.name }}</a>
        </div>
      </div>

      <div class="sidebar-section">
        <button class="sidebar-section-toggle" @click="showTags = !showTags">
          Tags
          <span class="toggle-icon" :class="{ open: showTags }">▾</span>
        </button>
        <div v-show="showTags" class="sidebar-section-content sidebar-tag-cloud">
          <a
            v-for="tag in tags"
            :key="tag.slug"
            :href="`/tag/${tag.slug}/`"
            class="badge badge-tag"
          >{{ tag.name }}</a>
        </div>
      </div>

      <div class="sidebar-section">
        <button class="sidebar-section-toggle" @click="showDates = !showDates">
          By Date
          <span class="toggle-icon" :class="{ open: showDates }">▾</span>
        </button>
        <div v-show="showDates" class="sidebar-section-content">
          <ul class="sidebar-archives-items">
            <li v-for="year in archives" :key="year.year" class="sidebar-archives-item">
              <a :href="`/archive/${year.year}/`">
                {{ year.year }}
                <span class="archive-count">{{ year.total }}</span>
              </a>
              <ul>
                <li
                  v-for="month in year.months"
                  :key="month.month"
                  class="sidebar-archives-subitem"
                >
                  <a :href="`/archive/${year.year}/${month.month}/`">
                    {{ month.label }}
                    <span class="archive-count">{{ month.count }}</span>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </aside>
</template>
