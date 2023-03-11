export default {
	uri: process.env.MONGODB_URL,
	collection: 'migrations',
	migrationsPath: './migrations',
	autosync: false,
}
