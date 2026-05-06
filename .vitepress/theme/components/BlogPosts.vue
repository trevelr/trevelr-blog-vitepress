<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  pageSize: {
    type: Number,
    default: 6
  },
  title: {
    type: String,
    default: ''
  },
  titleTag: {
    type: String,
    default: 'h1'
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  scrollToTop: {
    type: Boolean,
    default: true
  }
})

const { theme } = useData ? useData() : { value: { authors: {} } }

const authors = computed(() => (theme?.value?.authors) || {})

const currentPage = ref(1)

const totalPages = computed(() =>
  props.posts.length ? Math.ceil(props.posts.length / props.pageSize) : 1
)

const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const cleanList = (value) => {
  if (Array.isArray(value)) return value
  if (value) return [value]
  return []
}

const getAuthor = (post) => {
  const key = (post.authorKey || post.author || 'trevelr').toLowerCase()
  return authors.value[key] || authors.value['trevelr'] || null
}

const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return props.posts.slice(start, start + props.pageSize)
})

const goToPage = (page) => {
  const next = Math.min(Math.max(page, 1), totalPages.value)
  currentPage.value = next
  if (props.scrollToTop && typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Reset to page 1 if the posts array changes size (e.g., filtering)
watch(
  () => props.posts.length,
  () => {
    currentPage.value = 1
  }
)

onMounted(() => {
  const cards = document.querySelectorAll('.post-grid-item')
  cards.forEach(card => {
    const angle = (Math.random() * 12 - 6).toFixed(2) + 'deg'
    card.style.setProperty('--rotate-angle', angle)
  })
})
</script>

<template>
  <div class="page">
    <div class="page-main">
      <div class="page-content">
        <component
          :is="titleTag"
          v-if="title"
          class="page-title"
        >
          {{ title }}
        </component>

        <div class="post-grid">
          <div
            v-for="post in pagedPosts"
            :key="post.link"
            class="post-grid-item"
          >
            <a :href="post.link" class="postcard-inner">
              <!-- Front: featured photo -->
              <div class="postcard-front">
                <img v-if="post.image" :src="post.image" :alt="post.title" />
                <div v-else class="postcard-front-blank">
                  <span>{{ post.title }}</span>
                </div>
              </div>
              <!-- Back: postcard content -->
              <div class="postcard-back">
                <div class="postcard-message">
                  <h2 class="postcard-title">{{ post.title }}</h2>
                  <p class="postcard-excerpt">{{ post.description }}</p>
                  <div class="postcard-meta">
                    <span v-if="getAuthor(post)">{{ getAuthor(post).name }}</span>
                    <span v-if="getAuthor(post) && post.date"> · </span>
                    <span>{{ formatDate(post.date) }}</span>
                    <div class="post-badges" v-if="cleanList(post.categories).length || cleanList(post.tags).length">
                      <span
                        v-for="cat in cleanList(post.categories)"
                        :key="`cat-${cat}`"
                        class="badge badge-category"
                      >{{ cat }}</span>
                      <span
                        v-for="tag in cleanList(post.tags)"
                        :key="`tag-${tag}`"
                        class="badge badge-tag"
                      >#{{ tag }}</span>
                    </div>
                  </div>
                  <span class="postcard-read-cta">Read post →</span>
                </div>
                <div class="postcard-address">
                  <div class="postcard-stamp">✈</div>
                  <div v-if="getAuthor(post)" class="postcard-author-chip">
                    <img
                      :src="getAuthor(post).avatar"
                      :alt="getAuthor(post).name"
                      class="postcard-author-avatar"
                    />
                    <span class="postcard-author-name">{{ getAuthor(post).name }}</span>
                  </div>
                  <div class="postcard-address-lines">
                    <div class="postcard-address-line"></div>
                    <div class="postcard-address-line"></div>
                    <div class="postcard-address-line"></div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>

        <div class="pagination" v-if="showPagination && totalPages > 1">
          <button class="btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
            Previous
          </button>
          <span class="pagination-meta">
            Page {{ currentPage }} / {{ totalPages }}
          </span>
          <button class="btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
            Next
          </button>
        </div>
      </div>

      <div class="page-sidebar">
        <Sidebar />
      </div>
    </div>
  </div>
</template>
