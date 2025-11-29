import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Auth from '../pages/Auth.vue'
import CustomForm from '../pages/CustomForm.vue'
import BookDisplay from '../pages/BookDisplay.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/auth', name: 'Auth', component: Auth },
  { path: '/custom', name: 'CustomForm', component: CustomForm },
  { path: '/book', name: 'BookDisplay', component: BookDisplay }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
