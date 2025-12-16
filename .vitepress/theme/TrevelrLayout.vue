<script setup>
import { computed } from 'vue'
import { Content, useData, useRoute } from 'vitepress'

const { theme } = useData()
const route = useRoute()

const modules = import.meta.glob('/blog/*.md', { eager: true })

const authors = {
  trevelr: {
    name: 'The Trevelr',
    avatar: '/assets/img/trevelr-avatar.png',
    bio: 'Explorer, adventurer, and seeker of rare finds and extraordinary experiences.'
  }
}

const posts = computed(() =>
  Object.entries(modules)
    .map(([path, mod]) => {
      const pageData = mod.__pageData || {}
      const fm = pageData.frontmatter || {}
      const authorKey = (fm.author || '').toLowerCase()
      const slug = pageData.relativePath
        ? pageData.relativePath.replace(/^blog\//, '').replace(/\.md$/, '')
        : path.replace('/blog/', '').replace(/\.md$/, '')
      return {
        slug,
        title: fm.title || pageData.title || slug,
        date: fm.date || '',
        description: fm.description || pageData.description || '',
        image: fm.image || fm.img || '',
        authorKey,
        tags: Array.isArray(fm.tags) ? fm.tags : fm.tags ? [fm.tags] : [],
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
)

const isBlogPostPage = computed(() => {
  const cleanPath = route.path.replace(/\/+$/, '').replace(/\.html$/, '')
  return cleanPath.startsWith('/blog/') && cleanPath !== '/blog/index'
})

const currentPost = computed(() => {
  if (!isBlogPostPage.value) return null
  const slug = route.path
    .replace(/\/+$/, '')
    .replace(/\.html$/, '')
    .replace(/^\/blog\//, '')
  return posts.value.find((p) => p.slug === slug) || null
})

const prevNext = computed(() => {
  if (!currentPost.value) return { prev: null, next: null }
  const idx = posts.value.findIndex((p) => p.slug === currentPost.value.slug)
  return {
    prev: idx > 0 ? posts.value[idx - 1] : null,
    next: idx < posts.value.length - 1 ? posts.value[idx + 1] : null
  }
})
</script>

<template>
  <div class="site">

    <header class="site-header">
      <div class="site-logo">
        <a href="/">
          <img :src="theme.logo" alt="Trevelr logo" />
        </a>
      </div>

      <nav class="site-nav">
        <a
          v-for="item in theme.nav"
          :key="item.link"
          :href="item.link"
        >
          {{ item.text }}
        </a>
      </nav>

      <div class="site-socials">
        <a v-for="social in theme.socialLinks" target="_blank" :href="social.link">
          <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
            <path :d="social.svgPath"/>
          </svg>
        </a>
      </div>
    </header>

    <main class="site-main">
      <template v-if="isBlogPostPage">
        <div class="page">
          <div class="page-main">
            <div class="page-content post-layout">
              <div class="post-hero" v-if="currentPost?.image">
                <img :src="currentPost.image" :alt="currentPost.title" />
              </div>
              <h1 class="page-title">{{ currentPost?.title }}</h1>
              <div
                class="post-meta-card"
                v-if="currentPost?.date || currentPost?.categories?.length || currentPost?.tags?.length"
              >
                <div
                  class="author-info"
                  v-if="authors[currentPost?.authorKey || 'trevelr']"
                >
                  <img
                    class="author-avatar"
                    :src="authors[currentPost?.authorKey || 'trevelr'].avatar"
                    :alt="authors[currentPost?.authorKey || 'trevelr'].name"
                  />
                  <div class="author-details">
                    <div class="author-name">
                      {{ authors[currentPost?.authorKey || 'trevelr'].name }}
                    </div>
                    <p class="author-bio">
                      {{ authors[currentPost?.authorKey || 'trevelr'].bio }}
                    </p>
                  </div>
                </div>
                <p class="post-meta" v-if="currentPost?.date">
                  {{ new Date(currentPost.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) }}
                </p>
                <div class="post-badges" v-if="currentPost?.categories?.length || currentPost?.tags?.length">
                  <span
                    v-for="cat in currentPost?.categories || []"
                    :key="`cat-${cat}`"
                    class="badge badge-category"
                  >
                    {{ cat }}
                  </span>
                  <span
                    v-for="tag in currentPost?.tags || []"
                    :key="`tag-${tag}`"
                    class="badge badge-tag"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>
              <Content />
              <div class="post-pagination">
                <a v-if="prevNext.prev" :href="prevNext.prev.link" class="btn ghost">← {{ prevNext.prev.title }}</a>
                <a v-if="prevNext.next" :href="prevNext.next.link" class="btn ghost"> {{ prevNext.next.title }} →</a>
              </div>
            </div>
            <div class="page-sidebar">
              <Sidebar />
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <Content />
      </template>
    </main>

    <footer class="site-footer">
      {{ theme.footer.message }}<br />
      {{ theme.footer.copyright }}
    </footer>

  </div>
</template>
