
import { createRouter, createWebHashHistory } from 'vue-router'

// Import the components (pages) you want to route to
import MasterPasswordPage from './windows/masterPassword.vue'
import AuthPage from './windows/authPage.vue'
import MainPage from './windows/mainPage.vue'

const router = createRouter({
  history: createWebHashHistory(), // Hash mode works well with Electron
  routes: [
    { path: '/setup_password', component: MasterPasswordPage },
    { path: '/auth', component: AuthPage },
    { path: '/main', component: MainPage },

    // Redirect root path to either a default page or auth
    { path: '/', redirect: '/auth' }
  ]
})

export default router