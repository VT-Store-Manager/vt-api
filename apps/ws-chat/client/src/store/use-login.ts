import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useRequest } from './use-request'

export const useLogin = defineStore('login', () => {
	const phone = ref('')

	const {
		data,
		pending,
		error,
		fetch: _f,
	} = useRequest<string>('/api/user/login', {
		method: 'POST',
		data: {
			phone: phone.value,
		},
	})

	const fetch = async () => {
		await _f({
			data: {
				phone: phone.value,
			},
		})
	}

	return { phone, data, pending, fetch, error }
})
