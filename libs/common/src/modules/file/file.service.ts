import { AnyExpression, Connection, Expression, Types } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

import {
	AppName,
	NodeEnv,
	getFileExtension,
	s3KeyPattern,
	urlPattern,
} from '@app/common'
import {
	DeleteObjectsCommand,
	DeleteObjectsCommandInput,
	GetObjectCommand,
	GetObjectCommandInput,
	HeadObjectCommand,
	HeadObjectCommandInput,
	PutObjectCommand,
	PutObjectCommandInput,
	S3Client,
} from '@aws-sdk/client-s3'
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectConnection } from '@nestjs/mongoose'

@Injectable()
export class FileService {
	private s3: S3Client
	private bucketName: string
	// App url values
	private nodeEnv: NodeEnv
	private host: string
	private port: number
	private clientPort: number
	private salePort: number
	private adminPort: number

	constructor(
		@InjectConnection() private readonly connection: Connection,
		private readonly configService: ConfigService
	) {
		this.s3 = new S3Client({
			credentials: {
				accessKeyId: configService.get<string>('aws.accessKeyId'),
				secretAccessKey: configService.get<string>('aws.secretAccessKey'),
			},
			region: configService.get<string>('aws.region'),
		})
		this.bucketName = this.configService.get<string>('aws.bucketName')

		this.nodeEnv = this.configService.get<NodeEnv>('nodeEnv')
		this.host = this.configService
			.get<string>('host')
			.replace(/^https?:\/\//g, '')
		this.port = this.configService.get<number>('port')

		this.clientPort = this.configService.get<number>('dev.clientPort')
		this.salePort = this.configService.get<number>('dev.salePort')
		this.adminPort = this.configService.get<number>('dev.adminPort')
	}

	getAppUrl(appName = AppName.CLIENT) {
		if (this.nodeEnv === NodeEnv.PRODUCTION) {
			const prodPort = this.port || 443
			return `https://${this.host}${
				[80, 443].includes(prodPort) ? '' : `:${prodPort}`
			}`
		}

		let devPort = this.port || 80
		if (appName === AppName.CLIENT) {
			devPort = this.clientPort || devPort
		} else if (appName === AppName.SALE) {
			devPort = this.salePort || devPort
		} else if (appName === AppName.ADMIN) {
			devPort = this.adminPort || devPort
		}

		return `http://${this.host}${
			[80, 443].includes(devPort) ? '' : `:${devPort}`
		}`
	}

	private getImagePrefixUrl(appName = AppName.CLIENT) {
		const appUrl = this.getAppUrl(appName)
		const imageUrlPrefix = 'api/file/'

		return `${appUrl}/${imageUrlPrefix}`
	}

	getImageUrl(url: string, appName = AppName.CLIENT) {
		if (urlPattern.test(url)) {
			return url
		} else if (s3KeyPattern.test(url)) {
			return this.getImagePrefixUrl(appName) + url
		}
		return url
	}

	getImageUrlExpression(
		imageExpression: string | AnyExpression | Expression,
		defaultImageUrl?: string | AnyExpression | Expression,
		appName = AppName.CLIENT
	): AnyExpression | Expression {
		const imageUrl = this.getImagePrefixUrl(appName)

		const isS3KeyExpr = {
			$regexMatch: {
				input: imageExpression,
				regex: s3KeyPattern,
			},
		}
		const isFullUrlExpr = {
			$regexMatch: {
				input: imageExpression,
				regex: urlPattern,
			},
		}
		const isFullUrlDefaultImageExpr = {
			$regexMatch: {
				input: defaultImageUrl,
				regex: urlPattern,
			},
		}

		return {
			$cond: {
				if: {
					$or: [isS3KeyExpr, isFullUrlExpr],
				},
				then: {
					$cond: {
						if: isS3KeyExpr,
						then: { $concat: [imageUrl, imageExpression] },
						else: imageExpression,
					},
				},
				else: defaultImageUrl
					? {
							$cond: {
								if: isFullUrlDefaultImageExpr,
								then: defaultImageUrl,
								else: { $concat: [imageUrl, defaultImageUrl] },
							},
					  }
					: null,
			},
		}
	}

	createObjectKey(path: string[] = [], originalFilename: string) {
		const ext = getFileExtension(originalFilename)
		return [...path, uuidv4() + ext].filter(s => s.length > 0).join('/')
	}

	async upload(
		dataBuffer: Buffer,
		key: string,
		abortController?: AbortController
	) {
		const params: PutObjectCommandInput = {
			Bucket: this.bucketName,
			Key: key,
			Body: dataBuffer,
		}
		const command = new PutObjectCommand(params)
		const uploadResult = await this.s3.send(
			command,
			abortController ? { abortSignal: abortController.signal } : {}
		)
		if (uploadResult.$metadata.httpStatusCode !== 200) {
			throw new BadRequestException('Upload image failed')
		}
		return { key }
	}

	/**
	 * It takes an array of files, and an array of paths, and returns an array of public files
	 * @param {Express.Multer.File[]} files - Express.Multer.File[] - This is the array of files that were
	 * uploaded.
	 * @param {string[]} path - string[]
	 * @returns An array of public files
	 */
	async uploadMulti(
		files: Express.Multer.File[],
		keys: string[],
		abortController?: AbortController
	) {
		if (files.length > keys.length) {
			throw new Error('Number of keys must be equal to number of files')
		}
		const uploadResults = await Promise.all(
			files.map((file, index) =>
				this.upload(file.buffer, keys[index], abortController)
			)
		)

		return uploadResults
	}

	/**
	 * It takes a buffer and a key, and uploads the buffer to the S3 bucket with the key
	 * @param {Buffer} buffer - The buffer of the file you want to upload
	 * @param {string} key - The key of the file you want to override.
	 * @returns The result of the upload.
	 */
	async overrideFile(
		buffer: Buffer,
		key: string,
		abortController?: AbortController
	) {
		if (!key || !s3KeyPattern.test(key)) return null
		const exist = await this.checkFile(key)
		if (!exist) return null

		const params: PutObjectCommandInput = {
			Bucket: this.bucketName,
			Key: key,
			Body: buffer,
		}
		const command = new PutObjectCommand(params)
		const overrideResult = await this.s3.send(
			command,
			abortController ? { abortSignal: abortController.signal } : {}
		)

		if (overrideResult.$metadata.httpStatusCode !== 200) {
			throw new BadRequestException('Failed to upload object')
		}
		return { key }
	}

	/**
	 * It deletes files from the database and S3
	 * @param {Types.ObjectId[]} fileIds - The ids of the files to delete
	 * @returns The deleteResult is an array of the results of the two promises.
	 */
	async delete(keys: string[], abortController?: AbortController) {
		const existKeys = (
			await Promise.all(
				keys.map(async key => {
					const exist = await this.checkFile(key)
					return exist ? key : null
				})
			)
		).filter(v => v)
		if (existKeys.length === 0) return null

		const params: DeleteObjectsCommandInput = {
			Bucket: this.bucketName,
			Delete: {
				Objects: existKeys.map(key => ({ Key: key })),
			},
		}

		const command = new DeleteObjectsCommand(params)
		const deleteResult = await this.s3.send(
			command,
			abortController ? { abortSignal: abortController.signal } : {}
		)
		if (deleteResult.$metadata.httpStatusCode !== 200)
			throw new BadRequestException('Failed to delete objects')
		return deleteResult.Deleted.map(deleted => ({
			key: deleted.Key,
			versionId: deleted.VersionId,
		}))
	}

	/**
	 * It gets a file from S3
	 * @param {string} key - The name of the file you want to get.
	 * @returns The getResult is being returned.
	 */
	async getFile(key: string) {
		const params: GetObjectCommandInput = {
			Bucket: this.bucketName,
			Key: key,
		}
		const command = new GetObjectCommand(params)
		const getResult = await this.s3.send(command)
		if (getResult.$metadata.httpStatusCode !== 200) {
			throw new BadRequestException('Failed to get object')
		}

		return await getResult.Body.transformToByteArray()
	}

	/**
	 * It checks if a file exists in the S3 bucket
	 * @param {string} key - The key of the file you want to check.
	 * @returns A boolean value
	 */
	async checkFile(key: string, throwError = false) {
		try {
			const params: HeadObjectCommandInput = {
				Bucket: this.bucketName,
				Key: key,
			}
			const command = new HeadObjectCommand(params)
			await this.s3.send(command)
			return true
		} catch {
			if (throwError) throw new NotFoundException('File not found')
			else return false
		}
	}

	async getMainImage(collectionName: string, id: string) {
		const data = await this.connection
			.collection(collectionName)
			.findOne({ _id: new Types.ObjectId(id) })

		if (!data) {
			throw new NotFoundException(`Data is not found`)
		}
		const mainImage = data.image || data.images?.[0]

		if (!mainImage) {
			throw new NotFoundException(
				`Image of collection ${collectionName} is not found`
			)
		}
		return mainImage
	}
}
