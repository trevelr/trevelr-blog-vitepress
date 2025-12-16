<script setup lang="ts">
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

const categoryMap = new Map<string, { name: string; slug: string; count: number }>()
const tagMap = new Map<string, { name: string; slug: string; count: number }>()
const yearMap = new Map<
  string,
  { year: string; total: number; months: Map<string, { month: string; label: string; count: number }> }
>()

Object.values(modules).forEach((mod) => {
  const pageData = mod.__pageData || {}
  const fm = pageData.frontmatter || {}

  // categories: support single "category" or array "categories"
  const catList = Array.isArray(fm.categories)
    ? fm.categories
    : fm.category
      ? [fm.category]
      : []
  catList.forEach((cat: string) => {
    const name = String(cat)
    const slug = slugify(name)
    const existing = categoryMap.get(slug)
    if (existing) {
      existing.count += 1
    } else {
      categoryMap.set(slug, { name, slug, count: 1 })
    }
  })

  // tags: support string or array
  const tagList = Array.isArray(fm.tags) ? fm.tags : fm.tags ? [fm.tags] : []
  tagList.forEach((tag: string) => {
    const name = String(tag)
    const slug = slugify(name)
    const existing = tagMap.get(slug)
    if (existing) {
      existing.count += 1
    } else {
      tagMap.set(slug, { name, slug, count: 1 })
    }
  })

  // archive: derive year/month from date
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

    <div class="sidebar-archives sidebar-card"> 
      <h3 class="sidebar-archives-title">Categories</h3>
      <ul class="sidebar-archives-items">
        <li v-for="cat in categories" :key="cat.slug" class="sidebar-archives-item">
          <a :href="`/category/${cat.slug}/`">
            {{ cat.name }} ({{ cat.count }})
          </a>
        </li>
      </ul>

      <h3 class="sidebar-archives-title">Tags</h3>
      <ul class="sidebar-archives-items">
        <li v-for="tag in tags" :key="tag.slug" class="sidebar-archives-item">
          <a :href="`/tag/${tag.slug}/`">
            {{ tag.name }} ({{ tag.count }})
          </a>
        </li>
      </ul>

      <h3 class="sidebar-archives-title">Date</h3>
      <ul class="sidebar-archives-items">
        <li v-for="year in archives" :key="year.year" class="sidebar-archives-item">
          <a :href="`/archive/${year.year}/`">
            {{ year.year }} ({{ year.total }})
          </a>
          <ul>
            <li
              v-for="month in year.months"
              :key="month.month"
              class="sidebar-archives-subitem"
            >
              <a :href="`/archive/${year.year}/${month.month}/`">
                {{ month.label }} ({{ month.count }})
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </aside>
</template>
