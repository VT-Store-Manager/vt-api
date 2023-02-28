import { NodeEnv } from '@/common/constants'

export default () => ({
	nodeEnv: process.env.NODE_ENV ?? NodeEnv.DEVELOPMENT,
	port: parseInt(process.env.PORT, 10) || 8080,
	database: {
		url: process.env.MONGODB_URL,
	},
})
