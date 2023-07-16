import * as bcrypt from 'bcrypt'

export const hash = (password: string): string => {
	const saltRounds = 10
	return bcrypt.hashSync(password, saltRounds)
}

export const compare = (password: string, hash: string): boolean => {
	return bcrypt.compareSync(password, hash)
}
