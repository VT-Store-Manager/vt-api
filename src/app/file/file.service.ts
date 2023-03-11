import { v4 as uuidv4 } from 'uuid'

import { getFileExtension } from '@/common/helpers/file.helper'
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

@Injectable()
export class FileService {
	private s3: S3Client
	private bucketName: string

	constructor(private configService: ConfigService) {
		this.s3 = new S3Client({
			credentials: {
				accessKeyId: configService.get<string>('aws.accessKeyId'),
				secretAccessKey: configService.get<string>('aws.secretAccessKey'),
			},
			region: configService.get<string>('aws.region'),
		})
		this.bucketName = this.configService.get<string>('aws.bucketName')
	}

	createObjectKey(path: string[] = [], originalFilename: string) {
		const ext = getFileExtension(originalFilename)
		return [...path, uuidv4() + ext].filter(s => s.length > 0).join('/')
	}

	async upload(dataBuffer: Buffer, key: string) {
		const params: PutObjectCommandInput = {
			Bucket: this.bucketName,
			Key: key,
			Body: dataBuffer,
		}
		const command = new PutObjectCommand(params)
		const uploadResult = await this.s3.send(command)
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
	async uploadMulti(files: Express.Multer.File[], keys: string[]) {
		if (files.length > keys.length) {
			throw new Error('Number of keys must be equal to number of files')
		}
		const uploadResults = await Promise.all(
			files.map((file, index) => this.upload(file.buffer, keys[index]))
		)

		return uploadResults
	}

	/**
	 * It takes a buffer and a key, and uploads the buffer to the S3 bucket with the key
	 * @param {Buffer} buffer - The buffer of the file you want to upload
	 * @param {string} key - The key of the file you want to override.
	 * @returns The result of the upload.
	 */
	async overrideFile(buffer: Buffer, key: string) {
		await this.checkFile(key)

		const params: PutObjectCommandInput = {
			Bucket: this.bucketName,
			Key: key,
			Body: buffer,
		}
		const command = new PutObjectCommand(params)
		const overrideResult = await this.s3.send(command)

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
	async delete(keys: string[]) {
		await Promise.all(keys.map(key => this.checkFile(key)))

		const params: DeleteObjectsCommandInput = {
			Bucket: this.bucketName,
			Delete: {
				Objects: keys.map(key => ({ Key: key })),
			},
		}

		const command = new DeleteObjectsCommand(params)
		const deleteResult = await this.s3.send(command)
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
		await this.checkFile(key)

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
	private async checkFile(key: string) {
		try {
			const params: HeadObjectCommandInput = {
				Bucket: this.bucketName,
				Key: key,
			}
			const command = new HeadObjectCommand(params)
			await this.s3.send(command)
			return true
		} catch {
			throw new NotFoundException('File not found')
		}
	}
}
