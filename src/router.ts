
import { createRouter, createWebHashHistory } from 'vue-router'

// Import the components (pages) you want to route to
import SetupPage from './pages/SetupPage.vue'
import LoginPage from './pages/LoginPage.vue'
import MainPage from './pages/MainPage.vue'

const router = createRouter({
  history: createWebHashHistory(), // Hash mode works well with Electron
  routes: [
    { path: '/setup', component: SetupPage },
    { path: '/login', component: LoginPage },
    { path: '/main', component: MainPage },
    // Fallback route in case no route matches
    { path: '/:catchAll(.*)', redirect: '/login' }
  ]
})

export default router
