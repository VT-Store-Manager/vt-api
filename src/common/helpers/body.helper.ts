export const clearUndefineOrNullField = (obj: Record<string | number, any>) => {
	Object.keys(obj).forEach(key => {
		if (obj[key] === undefined || obj[key] === null) {
			delete obj[key]
		} else if (typeof obj[key] !== 'object') {
			return
		} else {
			clearUndefineOrNullField(obj[key])
			if (Array.isArray(obj[key])) {
				obj[key] = obj[key].filter(
					value => value !== undefined || value !== null
				)
			}
		}
	})
}
