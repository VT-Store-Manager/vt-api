import { BadRequestException } from '@nestjs/common'
import { vnPhoneNumberPattern } from '../constants'

export const validateVnPhoneNumber = (
	phone: string,
	err: Error | null = new Error('Phone number is not valid')
): boolean => {
	const check = vnPhoneNumberPattern.test(phone)
	if (err === null) return false
	if (!check) throw err
	return true
}

export const getListVnPhone = (
	phone: string,
	err: Error = new BadRequestException(
		`This phone ${phone} is not Vietnam phone number`
	)
): string[] => {
	validateVnPhoneNumber(phone, err)

	if (phone.startsWith('+84')) {
		phone = phone.slice(3)
	} else if (phone.startsWith('84')) {
		phone = phone.slice(2)
	} else {
		phone = phone.slice(1)
	}

	return ['+84' + phone, '84' + phone, '0' + phone]
}

export const validateAndTransformPhone = (
	phoneNumber: string,
	err: Error | null = new BadRequestException(
		`This phone '${phoneNumber}' is not Vietnam phone number`
	)
): string => {
	validateVnPhoneNumber(phoneNumber, err)

	if (phoneNumber.startsWith('0')) {
		phoneNumber = '+84' + phoneNumber.slice(1)
	} else if (phoneNumber.startsWith('84')) {
		phoneNumber = '+' + phoneNumber
	}

	return phoneNumber
}
