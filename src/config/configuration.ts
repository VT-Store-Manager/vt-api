import { NodeEnv } from '@/common/constants'
import * as Joi from 'joi'

export const envConfiguration = () => ({
	nodeEnv: process.env.NODE_ENV ?? NodeEnv.DEVELOPMENT,
	port: parseInt(process.env.PORT, 10) || 8080,
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
})

export const envValidationSchema = Joi.object({
	PORT: Joi.number().default(8080),
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
		.pattern(/^\d(m|d)$/)
		.required(),
	REFRESH_TOKEN_SECRET_KEY: Joi.string().token().required(),
	REFRESH_TOKEN_EXPIRES_IN: Joi.string()
		.pattern(/^\d(m|d)$/)
		.required(),
	DISABLE_SMS: Joi.string()
		.allow('true', 'false', true, false, '0', '1', 0, 1)
		.default(false),
})
