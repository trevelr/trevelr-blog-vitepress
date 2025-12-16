---
title: About
---

<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
  // Load Leaflet CSS
  const leafletCSS = document.createElement('link')
  leafletCSS.rel = 'stylesheet'
  leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
  leafletCSS.crossOrigin = ''
  document.head.appendChild(leafletCSS)

  // Load Leaflet JS (ESM build from CDN)
  const L = await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js')

  const map = L.map('travel-map', {
    center: [35, 0], // world-ish
    zoom: 2,
    scrollWheelZoom: false,
    worldCopyJump: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  const pins = [
    { name: 'Phoenix, USA', coords: [33.4484, -112.0740] },
    { name: 'London, UK', coords: [51.5072, -0.1276] },
    { name: 'Paris, France (someday soon)', coords: [48.8566, 2.3522] }
  ]

  pins.forEach(pin => {
    L.marker(pin.coords)
      .addTo(map)
      .bindPopup(`<b>${pin.name}</b>`)
  })
})
</script>

<div class="page">
  <div class="page-main">
    <div class="page-content">

# Hey, some things you'll see here

- Trip notes (sometimes unfinished)  
- Cities and neighborhoods worth wandering  
- Cafés I felt were worth sharing
- Transit, timing, costs, and tradeoffs

## The "Been There" Map

<div id="travel-map" class="travel-map"></div>

## Disclaimer

This isn’t full-time travel or remote-work fantasy land blog.  
I just write stuff down sometimes, and once I get enough stuff to make a post it goes up completely sporatic.

</div>
<div class="page-sidebar">
  <div class="card">
    <h3>Contact</h3>
    <p>
    📧 Email: <a href="mailto:hey@trevelr.blog">hey@trevelr.blog</a><br />
    📸 Instagram: <a href="https://www.instagram.com/trevelr_blog/">@trevelr_blog</a><br />
    💬 Discord: <a href="https://discord.gg/B5BbcSPC">Trevelr server</a><br />
    </p>
  </div>
</div>
</div>
</div>
