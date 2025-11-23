---
title: Home
---

<script setup>
import { onMounted } from 'vue'
/**
 * Load all markdown files in /blog (eager = immediate import)
 * Each mod contains:
 *    mod.__pageData.title
 *    mod.__pageData.description
 *    mod.__pageData.frontmatter
 *    mod.__pageData.relativePath
 */
const modules = import.meta.glob('./blog/*.md', { eager: true })

const featuredPosts = Object.entries(modules)
  .map(([path, mod]) => {
    const pageData = mod.__pageData || {}
    const fm = pageData.frontmatter || {}

    // Skip the blog index page itself
    if (pageData.relativePath === 'blog/index.md') return null

    const tags = fm.tags || []

    const isFeatured =
      fm.featured === true ||
      (Array.isArray(tags) && tags.includes('featured'))

    if (!isFeatured) return null

  const slug = pageData.relativePath
    .replace(/^blog\//, '')
    .replace(/\.md$/, '')

  return {
    title: fm.title || pageData.title || slug,
    description: fm.description || pageData.description || '',
    image: fm.image || fm.img || '',
    date: fm.date || '',
    author: fm.author || 'jon',
    tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
    categories: Array.isArray(fm.categories)
      ? fm.categories
      : fm.category
        ? [fm.category]
          : [],
      link: `/blog/${slug}`
    }
  })
  .filter(Boolean)
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  
const hasFeatured = featuredPosts.length > 0

onMounted(() => {
  const cards = document.querySelectorAll('.post-grid-item')
  cards.forEach(card => {
    const angle = (Math.random() * 12 - 6).toFixed(2) + 'deg'
    card.style.setProperty('--rotate-angle', angle)
  })
})
</script>

<div class="hero">
  <h1 class="hero-title">I Just Like Going Places</h1>
  <p class="hero-subtitle">Discover the world, one cup of coffee at a time.</p>
  <a href="#letsgo" class="btn">Let’s Go</a>
</div>

<div class="home-images">
  <img src="/assets/img/airplane.png" class="home-image" style="width: 24rem; top: -4rem; right: 6rem;" />
  <img src="/assets/img/cloud-1.png" class="home-image" style="width: 24rem; top: 4rem; left: 12rem;" />
  <img src="/assets/img/cloud-2.png" class="home-image" style="width: 12rem; bottom: 12rem; right: 6rem;" />
  <img src="/assets/img/cloud-3.png" class="home-image" style="width: 12rem; bottom: 24rem; left: 6rem;" />
  <img src="/assets/img/circle.png" class="home-image" style="width: 12rem; bottom: -4rem; left: 6rem;" />
  <img src="/assets/img/circle.png" class="home-image" style="width: 20rem; bottom: -6rem; left: -12rem;" />
  <img src="/assets/img/circle.png" class="home-image" style="width: 20rem; bottom: -8rem; right:-12rem;" />
  <img src="/assets/img/trevelr.png" class="home-image" style="width: 12rem; bottom: -12rem; left: 50vw;" />
</div>

<div id="letsgo" class="page">
  <div class="page-main">
  </div>
</div>

<div class="featured">
  <BlogPosts
    :posts="featuredPosts"
    title="Featured Posts"
    title-tag="h2"
    :show-pagination="false"
    :page-size="12"
    :scroll-to-top="false"
  />
</div>
