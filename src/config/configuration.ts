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
})

export const envValidationSchema = Joi.object({
	PORT: Joi.number().default(8080),
	MONGODB_URL: Joi.string().required(),
	AWS_REGION: Joi.string().required(),
	AWS_ACCESS_KEY_ID: Joi.string().required(),
	AWS_SECRET_ACCESS_KEY: Joi.string().required(),
	AWS_PUBLIC_BUCKET_NAME: Joi.string().required(),
})
