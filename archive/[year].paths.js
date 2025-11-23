const fs = require('fs')
const path = require('path')

const blogDir = path.join(__dirname, '..', 'blog')

const parseFrontmatter = (content) => {
  const match = /^---\n([\s\S]*?)\n---/m.exec(content)
  if (!match) return {}
  const lines = match[1].split('\n')
  const data = {}
  lines.forEach((line) => {
    const [rawKey, ...rest] = line.split(':')
    if (!rawKey) return
    const key = rawKey.trim()
    const valueRaw = rest.join(':').trim()
    if (!key) return
    data[key] = valueRaw.replace(/^['"]|['"]$/g, '')
  })
  return data
}

const years = new Set()
fs.readdirSync(blogDir).forEach((file) => {
  if (!file.endsWith('.md')) return
  const content = fs.readFileSync(path.join(blogDir, file), 'utf8')
  const fm = parseFrontmatter(content)
  const dateStr = fm.date
  if (!dateStr) return
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return
  years.add(String(d.getFullYear()))
})

module.exports = {
  paths: () => Array.from(years).map((year) => ({ params: { year } }))
}
