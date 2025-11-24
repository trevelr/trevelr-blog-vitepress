<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'

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
const route = useRoute()

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const allPosts = Object.entries(modules)
  .map(([path, mod]) => {
    const pageData = mod.__pageData || {}
    const fm = pageData.frontmatter || {}

    // skip this index page itself
    if (pageData.relativePath === 'blog/index.md') return null

    const slug = pageData.relativePath
      ? pageData.relativePath.replace(/^blog\//, '').replace(/\.md$/, '')
      : path.replace('/blog/', '').replace(/\.md$/, '')

    return {
      title: fm.title || pageData.title || slug,
      description: fm.description || pageData.description || '',
      date: fm.date || '',
      image: fm.image || fm.img || '',
      author: fm.author || 'jon',
      link: `/blog/${slug}`,
      tags: Array.isArray(fm.tags) ? fm.tags : fm.tags ? [fm.tags] : [],
      categories: Array.isArray(fm.categories)
        ? fm.categories
        : fm.category
          ? [fm.category]
          : []
    }
  })
  .filter(Boolean)
  .sort((a, b) => (a.date < b.date ? 1 : -1))

const resolveLabel = (slug: string, values: string[]) => {
  for (const v of values) {
    if (slugify(String(v)) === slug) return String(v)
  }
  return slug
}

const filterMeta = computed(() => {
  const segments = route.path
    .replace(/\/+$/, '')
    .replace(/\.html$/, '')
    .split('/')
    .filter(Boolean)
  // Handle /tag/foo
  if (segments[0] === 'tag' && segments[1]) {
    return { type: 'tag', value: segments[1] }
  }
  // Handle /category/bar
  if (segments[0] === 'category' && segments[1]) {
    return { type: 'category', value: segments[1] }
  }
  // Handle /archive/2025 or /archive/2025/06
  if (segments[0] === 'archive' && segments[1]) {
    const year = segments[1]
    const month = segments[2]
    return { type: 'archive', year, month }
  }
  return { type: 'all' }
})

const filteredPosts = computed(() => {
  const meta = filterMeta.value
  if (meta.type === 'tag') {
    return allPosts.filter((post) =>
      post.tags.some((tag: string) => slugify(tag) === meta.value)
    )
  }
  if (meta.type === 'category') {
    return allPosts.filter((post) =>
      post.categories.some((cat: string) => slugify(cat) === meta.value)
    )
  }
  if (meta.type === 'archive') {
    return allPosts.filter((post) => {
      if (!post.date) return false
      const d = new Date(post.date)
      if (Number.isNaN(d.getTime())) return false
      const y = String(d.getFullYear())
      const m = String(d.getMonth() + 1).padStart(2, '0')
      if (meta.month) return y === meta.year && m === meta.month
      return y === meta.year
    })
  }
  return allPosts
})

const title = computed(() => {
  const meta = filterMeta.value
  if (meta.type === 'tag') {
    const label = resolveLabel(meta.value, filteredPosts.value.flatMap((p) => p.tags))
    return `Posts tagged “${label}”`
  }
  if (meta.type === 'category') {
    const label = resolveLabel(meta.value, filteredPosts.value.flatMap((p) => p.categories))
    return `Posts in “${label}”`
  }
  if (meta.type === 'archive') {
    if (meta.month) return `Posts from ${meta.year}-${meta.month}`
    return `Posts from ${meta.year}`
  }
  return 'Archive'
})
</script>

<template>
  <BlogPosts :posts="filteredPosts" :title="title" />
</template>
