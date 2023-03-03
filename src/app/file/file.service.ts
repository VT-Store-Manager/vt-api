import { S3 } from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { getFileExtension } from '@/common/helpers/file.helper'

@Injectable()
export class FileService {
	private s3: S3
	private bucketName: string

	constructor(private configService: ConfigService) {
		this.s3 = new S3({
			credentials: {
				accessKeyId: configService.get<string>('aws.accessKeyId'),
				secretAccessKey: configService.get<string>('aws.secretAccessKey'),
			},
		})
		this.bucketName = this.configService.get<string>('aws.bucketName')
	}

	/**
	 * It uploads a file to S3 and returns a PublicFile object
	 * @param {Buffer} dataBuffer - The file data in a Buffer format.
	 * @param {string[]} path - The path to the file. This is an array of strings, and each string is a
	 * folder.
	 * @param {string} filename - The name of the file that the user uploaded.
	 * @returns The publicFile object is being returned.
	 */
	async upload(dataBuffer: Buffer, path: string[], filename: string) {
		const ext = getFileExtension(filename)

		const params: S3.PutObjectRequest = {
			Bucket: this.bucketName,
			Key: [...path, uuidv4() + ext].filter(s => s.length > 0).join('/'),
			Body: dataBuffer,
		}
		const uploadResult = await this.s3.upload(params).promise()
		return uploadResult
	}

	/**
	 * It takes an array of files, and an array of paths, and returns an array of public files
	 * @param {Express.Multer.File[]} files - Express.Multer.File[] - This is the array of files that were
	 * uploaded.
	 * @param {string[]} path - string[]
	 * @returns An array of public files
	 */
	async uploadMulti(files: Express.Multer.File[], path: string[]) {
		/* A method to render the image. */
		const uploadResults = await Promise.all(
			files.map(file => this.upload(file.buffer, path, file.originalname))
		)

		return uploadResults
	}

	/**
	 * It deletes files from the database and S3
	 * @param {Types.ObjectId[]} fileIds - The ids of the files to delete
	 * @returns The deleteResult is an array of the results of the two promises.
	 */
	async delete(keys: string[]) {
		const deleteResult = await this.s3.deleteObjects({
			Bucket: this.bucketName,
			Delete: {
				Objects: keys.map(key => ({ Key: key })),
			},
		})
		return deleteResult
	}

	/**
	 * It gets a file from S3
	 * @param {string} key - The name of the file you want to get.
	 * @returns The getResult is being returned.
	 */
	async getFile(key: string) {
		const params: S3.GetObjectRequest = {
			Bucket: this.bucketName,
			Key: key,
		}
		const getResult = await this.s3.getObject(params).promise()

		return getResult
	}

	/**
	 * It takes a buffer and a key, and uploads the buffer to the S3 bucket with the key
	 * @param {Buffer} buffer - The buffer of the file you want to upload
	 * @param {string} key - The key of the file you want to override.
	 * @returns The result of the upload.
	 */
	async overrideFile(buffer: Buffer, key: string) {
		const params: S3.PutObjectRequest = {
			Bucket: this.bucketName,
			Key: key,
			Body: buffer,
		}
		const overrideResult = await this.s3.upload(params).promise()
		return overrideResult
	}
}
