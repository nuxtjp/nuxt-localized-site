import localizedSite from '../src/module'

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [[localizedSite, {
    contentRoot: '../examples/content'
  }]]
})
