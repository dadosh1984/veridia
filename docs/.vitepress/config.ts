import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'veridia',
  description: 'Model-agnostic quality through mechanics',
  base: '/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Usage', link: '/usage' },
      { text: 'Mechanics', link: '/mechanics' },
      { text: 'GitHub', link: 'https://github.com/dadosh1984/veridia' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Philosophy', link: '/philosophy' },
          { text: 'Quick Start', link: '/usage' },
        ],
      },
      {
        text: 'Core',
        items: [
          { text: 'Mechanics', link: '/mechanics' },
          { text: 'Verifiability', link: '/verifiability' },
          { text: 'Roadmap', link: '/roadmap' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Naming', link: '/naming' },
          { text: 'Reuse', link: '/reuse' },
        ],
      },
    ],
    search: { provider: 'local' },
  },
})
