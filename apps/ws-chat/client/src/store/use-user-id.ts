import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { useCookies } from '@vueuse/integrations/useCookies'

import { USER_ID_KEY } from '../constants'

export const useUserId = defineStore('user-id', () => {
	const cookies = useCookies([USER_ID_KEY])
	const userId = ref('')

	const refresh = () => {
		userId.value = cookies.get<string>(USER_ID_KEY)
	}
	refresh()

	watch(userId, value => {
		cookies.set(USER_ID_KEY, value)
	})

	return { userId, refresh }
})
