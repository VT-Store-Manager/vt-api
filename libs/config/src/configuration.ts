import { NodeEnv, Joi } from '@app/common'
import { hostname } from 'os'

export const envConfiguration = () => {
	const nodeEnv = process.env.NODE_ENV || NodeEnv.DEVELOPMENT
	const port = isNaN(+process.env.PORT) ? undefined : +process.env.PORT
	const host = process.env.APP_URL || hostname()

	const env = {
		nodeEnv,
		host,
		port,
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
			accessTokenAdminSecret: process.env.ACCESS_TOKEN_ADMIN_SECRET_KEY,
			refreshTokenAdminSecret: process.env.REFRESH_TOKEN_ADMIN_SECRET_KEY,
			accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
			refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
		},
		ws: {
			httpSecret: process.env.WS_HTTP_SECRET_KEY,
			host: process.env.WS_HOST,
		},
	}
	// DEV addition environment
	if (nodeEnv === NodeEnv.DEVELOPMENT) {
		Object.assign(env, {
			dev: {
				clientPort: isNaN(+process.env.CLIENT_PORT)
					? undefined
					: +process.env.CLIENT_PORT,
				salePort: isNaN(+process.env.SALE_PORT)
					? undefined
					: +process.env.SALE_PORT,
				adminPort: isNaN(+process.env.ADMIN_PORT)
					? undefined
					: +process.env.ADMIN_PORT,
				disableSmsFlag:
					process.env.DISABLE_SMS === 'true' || +process.env.DISABLE_SMS === 1,
			},
		})
	}

	return env
}

export const envValidationSchema = Joi.object({
	// Database
	MONGODB_URL: Joi.string().required(),
	MONGODB_DB: Joi.string().min(1).required(),
	// AWS
	AWS_REGION: Joi.string().required(),
	AWS_ACCESS_KEY_ID: Joi.string().required(),
	AWS_SECRET_ACCESS_KEY: Joi.string().required(),
	AWS_PUBLIC_BUCKET_NAME: Joi.string().required(),
	// Twilio
	TWILIO_ACCOUNT_SID: Joi.string().token().required(),
	TWILIO_AUTH_TOKEN: Joi.string().token().required(),
	TWILIO_VERIFICATION_SERVICE_SID: Joi.string().token().required(),
	// JWT
	ACCESS_TOKEN_SECRET_KEY: Joi.string().token().required(),
	ACCESS_TOKEN_EXPIRES_IN: Joi.string()
		.pattern(/^\d+(m|d)$/)
		.required(),
	REFRESH_TOKEN_SECRET_KEY: Joi.string().token().required(),
	REFRESH_TOKEN_EXPIRES_IN: Joi.string()
		.pattern(/^\d+(m|d)$/)
		.required(),
	ACCESS_TOKEN_ADMIN_SECRET_KEY: Joi.string().token().required(),
	REFRESH_TOKEN_ADMIN_SECRET_KEY: Joi.string().token().required(),
	// WS
	WS_HTTP_SECRET_KEY: Joi.string().token().required(),
	WS_HOST: Joi.string().uri().required(),
	// Flag
	DISABLE_SMS: Joi.string()
		.allow('true', 'false', true, false, '0', '1', 0, 1)
		.default(false),
})
