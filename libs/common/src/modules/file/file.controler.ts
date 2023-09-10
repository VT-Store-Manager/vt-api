import { Response } from 'express'

import {
	FormDataPipe,
	ImageMulterOption,
	S3KeyPipe,
	ObjectIdPipe,
} from '@app/common'
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
	Res,
	UploadedFile,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'

import { UploadFileDTO, UploadFileResponseDTO } from './dto/upload-file.dto'
import { UploadMultiFileDTO } from './dto/upload-multi-file.dto'
import { FileService } from './file.service'
import pluralize from 'pluralize'
import snakeCase from 'lodash/snakeCase'

@ApiTags('file')
@Controller({
	path: 'file',
	version: '1',
})
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file'))
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ type: UploadFileResponseDTO })
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Body(FormDataPipe<UploadFileDTO>) dto: UploadFileDTO
	) {
		const key = this.fileService.createObjectKey(dto.path, file.originalname)
		const abortController = new AbortController()
		try {
			return await this.fileService.upload(file.buffer, key, abortController)
		} catch (error) {
			abortController.abort()
			throw error
		}
	}

	@Post('upload-multi')
	@UseInterceptors(FilesInterceptor('files', undefined))
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ type: [UploadFileResponseDTO] })
	async uploadMultiFiles(
		@UploadedFiles() files: Express.Multer.File[],
		@Body(FormDataPipe<UploadMultiFileDTO>) dto: UploadMultiFileDTO
	) {
		const keys = files.map(file =>
			this.fileService.createObjectKey(dto.path, file.originalname)
		)
		const abortController = new AbortController()
		try {
			return await this.fileService.uploadMulti(files, keys, abortController)
		} catch (error) {
			abortController.abort()
			throw error
		}
	}

	@Put('override')
	@UseInterceptors(FileInterceptor('file'))
	@ApiConsumes('multipart/form-data')
	@ApiBody({ type: UploadFileDTO })
	@ApiResponse({ type: UploadFileResponseDTO })
	async override(
		@UploadedFile() file: Express.Multer.File,
		@Body('path', S3KeyPipe) key: string
	) {
		await this.fileService.checkFile(key, true)
		const abortController = new AbortController()
		try {
			return await this.fileService.overrideFile(
				file.buffer,
				key,
				abortController
			)
		} catch (error) {
			abortController.abort()
			throw error
		}
	}

	@Delete('delete')
	@ApiResponse({ type: [UploadFileResponseDTO] })
	async delete(@Query('keys') keys: string[]) {
		await Promise.all(keys.map(key => this.fileService.checkFile(key, true)))

		const abortController = new AbortController()
		try {
			return await this.fileService.delete(keys)
		} catch (error) {
			abortController.abort()
			throw error
		}
	}

	@Get('check')
	async checkExist(@Query('keys') keys: string[]) {
		const result = await Promise.all(
			keys.map(key => this.fileService.checkFile(key))
		)

		return result.reduce((res, exist, index) => {
			return Object.assign(res, { [keys[index]]: exist })
		}, {})
	}

	@Get('main-image/:type/:id')
	async getMainImageOfType(
		@Param('type') type: string,
		@Param('id', ObjectIdPipe) id: string,
		@Res() res: Response
	) {
		if (!type || !id) {
			throw new BadRequestException('Type or id is invalid')
		}
		const collectionName = pluralize(snakeCase(type))
		const imageKey = await this.fileService.getMainImage(collectionName, id)
		await this.render(imageKey, res)
	}

	@Get(':key(*)')
	async render(@Param('key', S3KeyPipe) key: string, @Res() res: Response) {
		await this.fileService.checkFile(key, true)
		const fileBody = await this.fileService.getFile(key)
		res.setHeader('Content-Type', 'image/png')
		res.setHeader('Cache-Control', 'public, max-age=10000')
		res.write(fileBody, 'binary')
		res.end(null, 'binary')
	}
}
