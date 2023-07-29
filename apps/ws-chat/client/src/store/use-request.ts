import { reactive, toRefs } from 'vue'
import axios, { AxiosRequestConfig } from 'axios'

export const useRequest = <T = any>(
	url: string,
	initConfig?: AxiosRequestConfig
) => {
	const states = reactive<{
		data: T | null
		status: number | null
		pending: boolean
		error: any
	}>({
		data: null,
		status: null,
		pending: false,
		error: null,
	})
	const defaultConfig: AxiosRequestConfig = {
		baseURL: 'http://localhost',
		url,
		timeout: 15000,
		...(initConfig || {}),
	}

	const fetch = async (config?: AxiosRequestConfig) => {
		states.pending = true
		states.error = null
		const { data, status } = await axios({
			...defaultConfig,
			...(config || {}),
		})
		states.pending = false
		states.data = data
		states.status = status
	}

	return { ...toRefs(states), fetch }
}
