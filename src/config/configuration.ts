export default () => ({
	port: parseInt(process.env.PORT, 10) || 8080,
	database: {
		url: process.env.MONGODB_URL,
	},
})
