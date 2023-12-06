import { ValidationError, validate } from 'class-validator'

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

export const validatePayload = async <T extends new () => T>(
	data: Record<string, any>,
	ValidatedInstance: InstanceType<T>
): Promise<ValidationError[]> => {
	const obj = new ValidatedInstance()
	Object.keys(data).forEach(key => {
		obj[key] = data[key]
	})

	return await validate(obj)
}
