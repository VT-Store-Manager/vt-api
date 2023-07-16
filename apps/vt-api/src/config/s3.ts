import {
	CreateBucketCommand,
	ListBucketsCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { Logger } from '@nestjs/common'

export default async (
	region: string,
	accessKeyId: string,
	secretAccessKey: string,
	bucketName: string
) => {
	const credentials = {
		accessKeyId,
		secretAccessKey,
	}
	const s3 = new S3Client({ region, credentials })

	const getBucketsResult = await s3.send(new ListBucketsCommand({}))
	if (getBucketsResult.$metadata.httpStatusCode !== 200) {
		Logger.error('Connect to AWS-SDK failed')
		return
	}
	const bucketNames = getBucketsResult.Buckets.map(b => b.Name)
	Logger.debug(
		`Successfully connect to ${getBucketsResult.Buckets.length} Bucket${
			getBucketsResult.Buckets.length > 1 ? 's' : ''
		}${
			getBucketsResult.Buckets.length > 0 ? ':' : ''
		} ${getBucketsResult.Buckets.map(b => b.Name).join(', ')}`,
		'S3Client'
	)
	if (!bucketNames.includes(bucketName)) {
		const createBucketResult = await s3.send(
			new CreateBucketCommand({ Bucket: bucketName })
		)
		if (createBucketResult.$metadata.httpStatusCode !== 200) {
			Logger.error(`Create Bucket ${bucketName} failed`, 'S3Client')
			return
		}
		Logger.debug(`Create Bucket ${bucketName} successful`, 'S3Client')
	}
}
