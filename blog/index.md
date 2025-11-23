---
title: Blog
---

<script setup>
const modules = import.meta.glob('/blog/*.md', { eager: true })

const posts = Object.entries(modules)
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
  // newest first if date present
  .sort((a, b) => (a.date < b.date ? 1 : -1))
</script>

<BlogPosts :posts="posts" title="Blog" :page-size="6" />
