import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './style.css'
import './demos/ipc'

const app = createApp(App)

// Use the router
app.use(router)

app.mount('#app').$nextTick(() => {
  postMessage({ payload: 'removeLoading' }, '*')
})
