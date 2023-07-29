import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

import LoginPage from '@/pages/LoginPage.vue'
import ChatPage from '@/pages/ChatPage.vue'

const routes: RouteRecordRaw[] = [
	{ path: '/login', component: LoginPage },
	{ path: '/', component: ChatPage },
]

export const router = createRouter({
	history: createWebHashHistory(),
	routes,
})
