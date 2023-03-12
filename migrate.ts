export default {
	uri: process.env.MONGODB_URL.replace('/?', `/${process.env.MONGODB_DB}?`),
	collection: 'migrations',
	migrationsPath: './migrations',
	autosync: false,
}
