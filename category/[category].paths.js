const fs = require('fs')
const path = require('path')

const blogDir = path.join(__dirname, '..', 'blog')

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

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
    if (valueRaw.startsWith('[') && valueRaw.endsWith(']')) {
      data[key] = valueRaw
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else {
      data[key] = valueRaw.replace(/^['"]|['"]$/g, '')
    }
  })
  return data
}

const categories = new Set()
fs.readdirSync(blogDir).forEach((file) => {
  if (!file.endsWith('.md')) return
  const content = fs.readFileSync(path.join(blogDir, file), 'utf8')
  const fm = parseFrontmatter(content)
  const list = Array.isArray(fm.categories)
    ? fm.categories
    : fm.category
      ? [fm.category]
      : []
  list.forEach((cat) => categories.add(slugify(cat)))
})

module.exports = {
  paths: () => Array.from(categories).map((category) => ({ params: { category } }))
}
