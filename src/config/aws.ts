import { Logger } from '@nestjs/common'
import { config as awsSdkConfig, S3 } from 'aws-sdk'

export default (
	region: string,
	accessKeyId: string,
	secretAccessKey: string,
	bucketName: string
) => {
	awsSdkConfig.update({
		region,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	})
	awsSdkConfig.getCredentials(err => {
		if (err) {
			Logger.error(err.stack, 'AWS')
		} else {
			Logger.debug('Connect to AWS SDK successful', 'AWS')
		}
	})

	new S3().createBucket(
		{
			Bucket: bucketName,
		},
		(err, _data) => {
			if (err) {
				Logger.verbose(`${err.name} - ${err.message}`, 'S3')
			} else {
				Logger.debug('Bucket is created successful', 'S3')
				Logger.debug('Bucket location: ' + _data.Location, 'S3')
			}
		}
	)
}
