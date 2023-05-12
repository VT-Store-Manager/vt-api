import { hostname } from 'os'

import { NodeEnv } from '@/common/constants'
import Joi from '@/common/validations/joi.validator'

export const envConfiguration = () => {
	const nodeEnv = process.env.NODE_ENV || NodeEnv.DEVELOPMENT
	const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 80
	let host = process.env.APP_URL || hostname()
	if (nodeEnv === NodeEnv.DEVELOPMENT) {
		if (!host.startsWith('http')) {
			host = 'http://' + host
		}
		const portPattern = /:\d+$/
		if (port === 80 || port === 443) {
			host = host.replace(portPattern, '')
		} else if (!portPattern.test(host)) {
			host += ':' + port
		} else {
			host = host.replace(portPattern, ':' + port)
		}
	}
	const imageUrl = host + '/api/v1/file/render?key='

	const env = {
		nodeEnv,
		host,
		port,
		imageUrl,
		database: {
			url: process.env.MONGODB_URL,
			db: process.env.MONGODB_DB,
		},
		aws: {
			region: process.env.AWS_REGION,
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			bucketName: process.env.AWS_PUBLIC_BUCKET_NAME,
		},
		twilio: {
			accountSid: process.env.TWILIO_ACCOUNT_SID,
			authToken: process.env.TWILIO_AUTH_TOKEN,
			serviceSid: process.env.TWILIO_VERIFICATION_SERVICE_SID,
		},
		jwt: {
			accessTokenSecret: process.env.ACCESS_TOKEN_SECRET_KEY,
			refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET_KEY,
			accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
			refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
		},
		flag: {
			disableSMS:
				process.env.DISABLE_SMS === 'true' || +process.env.DISABLE_SMS === 1,
		},
	}

	return env
}

export const envValidationSchema = Joi.object({
	MONGODB_URL: Joi.string().required(),
	AWS_REGION: Joi.string().required(),
	AWS_ACCESS_KEY_ID: Joi.string().required(),
	AWS_SECRET_ACCESS_KEY: Joi.string().required(),
	AWS_PUBLIC_BUCKET_NAME: Joi.string().required(),
	TWILIO_ACCOUNT_SID: Joi.string().token().required(),
	TWILIO_AUTH_TOKEN: Joi.string().token().required(),
	TWILIO_VERIFICATION_SERVICE_SID: Joi.string().token().required(),
	ACCESS_TOKEN_SECRET_KEY: Joi.string().token().required(),
	ACCESS_TOKEN_EXPIRES_IN: Joi.string()
		.pattern(/^\d+(m|d)$/)
		.required(),
	REFRESH_TOKEN_SECRET_KEY: Joi.string().token().required(),
	REFRESH_TOKEN_EXPIRES_IN: Joi.string()
		.pattern(/^\d+(m|d)$/)
		.required(),
	DISABLE_SMS: Joi.string()
		.allow('true', 'false', true, false, '0', '1', 0, 1)
		.default(false),
})
