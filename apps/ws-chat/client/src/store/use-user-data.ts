import { defineStore, storeToRefs } from 'pinia'
import { computed } from 'vue'

import { useRequest } from './use-request'
import { useUserId } from './use-user-id'

export type User = {
	id: string
	name: string
}

export const useUserData = defineStore('user-data', () => {
	const { userId } = storeToRefs(useUserId())
	const {
		data,
		pending,
		error,
		fetch: _f,
	} = useRequest<User[]>('/api/user/info', {
		method: 'GET',
	})

	const fetch = async (userId: string) => {
		await _f({
			data: {
				id: userId,
			},
		})
	}

	const me = computed(() => {
		if (!data.value) return null
		return data.value.find(user => user.id === userId.value)
	})

	const friends = computed(() => {
		if (!data.value) return []
		return data.value.filter(user => user.id !== userId.value)
	})

	const userMap = computed(() => {
		if (!data.value) return new Map()
		return new Map(data.value.map(user => [user.id, user]))
	})

	return {
		me,
		friends,
		data,
		userMap,
		pending,
		fetch,
		error,
	}
})
