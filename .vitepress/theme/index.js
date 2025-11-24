// https://vitepress.dev/guide/custom-theme
import TrevelrLayout from './TrevelrLayout.vue'
import Sidebar from './components/Sidebar.vue'
import BlogPosts from './components/BlogPosts.vue'
import ArchivePage from './components/ArchivePage.vue'
import './trevelr.css'

export default {
  Layout: TrevelrLayout,
  enhanceApp({ app, router, siteData }) {
    app.component('Sidebar', Sidebar)
    app.component('BlogPosts', BlogPosts)
    app.component('ArchivePage', ArchivePage)
  }
}
