import * as Joi from 'joi'

import { InternalServerErrorException } from '@nestjs/common'

export const colorHexToInt = (color: string) => {
	let result = ''
	if (color.startsWith('#')) {
		color = color.slice(1)
	}
	const { error } = Joi.string().hex().validate(color)
	if (error) {
		throw new InternalServerErrorException('Color hex string is invalid')
	}
	switch (color.length) {
		case 3:
			result =
				Array.from(Array(color.length).keys()).reduce((res, value) => {
					return res + color[value] + color[value]
				}, '') + 'ff'
			break
		case 4:
			result = Array.from(Array(color.length).keys()).reduce((res, value) => {
				return res + color[value] + color[value]
			}, '')
			break
		case 6:
			result = color + 'ff'
			break
		case 8:
			break
		default:
			throw new InternalServerErrorException('Color hex string is invalid')
	}

	return Number('0x' + result)
}
