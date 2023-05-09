export default {
	uri: process.env.MONGODB_URL.replace('/?', `/${process.env.MONGODB_DB}?`),
	collection: 'migrations',
	migrationsPath: './src/database/migrations',
	autosync: false,
}
