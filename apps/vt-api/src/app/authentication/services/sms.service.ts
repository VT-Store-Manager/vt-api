import { Twilio } from 'twilio'

import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SmsService {
	private twilioClient: Twilio
	private serviceSid: string

	constructor(private readonly configService: ConfigService) {
		const accountSid = configService.get<string>('twilio.accountSid')
		const authToken = configService.get<string>('twilio.authToken')

		this.twilioClient = new Twilio(accountSid, authToken)
		this.serviceSid = configService.get<string>('twilio.serviceSid')
	}

	async initiatePhoneNumberVerification(phoneNumber: string) {
		return await this.twilioClient.verify.v2
			.services(this.serviceSid)
			.verifications.create({ to: phoneNumber, channel: 'sms', locale: 'vi' })
	}

	async confirmPhoneNumber(phoneNumber: string, verificationCode: string) {
		try {
			const result = await this.twilioClient.verify.v2
				.services(this.serviceSid)
				.verificationChecks.create({ to: phoneNumber, code: verificationCode })

			if (!result.valid || result.status !== 'approved') {
				throw new BadRequestException('Wrong code provided')
			}
			return true
		} catch (error) {
			Logger.error(error)
			throw new BadRequestException('Wrong code provided')
		}
	}
}
