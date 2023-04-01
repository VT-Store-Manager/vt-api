import { Response } from 'express'

import { S3KeyPipe } from '@/common/pipes/s3-key.pipe'
import { ImageMulterOption } from '@/common/validations/file.validator'
import {
	Controller,
	Delete,
	Get,
	Post,
	Put,
	Query,
	Body,
	Res,
	UploadedFile,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'

import { FileService } from './file.service'
import { UploadFileResponseDTO, UploadFileDTO } from './dto/upload-file.dto'
import { UploadMultiFileDTO } from './dto/upload-multi-file.dto'
import { FormDataPipe } from '@/common/pipes/form-data.pipe'

@ApiTags('file')
@Controller({
	path: 'file',
	version: '1',
})
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file', ImageMulterOption()))
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ type: UploadFileResponseDTO })
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Body(FormDataPipe<UploadFileDTO>) dto: UploadFileDTO
	) {
		const key = this.fileService.createObjectKey(dto.path, file.originalname)
		return await this.fileService.upload(file.buffer, key)
	}

	@Post('upload-multi')
	@UseInterceptors(
		FilesInterceptor('files', undefined, ImageMulterOption(2, 6))
	)
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ type: [UploadFileResponseDTO] })
	async uploadMultiFiles(
		@UploadedFiles() files: Express.Multer.File[],
		@Body(FormDataPipe<UploadMultiFileDTO>) dto: UploadMultiFileDTO
	) {
		const keys = files.map(file =>
			this.fileService.createObjectKey(dto.path, file.originalname)
		)
		return await this.fileService.uploadMulti(files, keys)
	}

	@Put('override')
	@UseInterceptors(FileInterceptor('file', ImageMulterOption()))
	@ApiConsumes('multipart/form-data')
	@ApiBody({ type: UploadFileDTO })
	@ApiResponse({ type: UploadFileResponseDTO })
	async override(
		@UploadedFile() file: Express.Multer.File,
		@Body('key', S3KeyPipe) key: string
	) {
		await this.fileService.checkFile(key, true)
		return await this.fileService.overrideFile(file.buffer, key)
	}

	@Get('render')
	async render(@Query('key', S3KeyPipe) key: string, @Res() res: Response) {
		await this.fileService.checkFile(key, true)
		const fileBody = await this.fileService.getFile(key)
		res.setHeader('Content-Type', 'image/png')
		res.setHeader('Cache-Control', 'public, max-age=10000')
		res.write(fileBody, 'binary')
		res.end(null, 'binary')
	}

	@Delete('delete')
	@ApiResponse({ type: [UploadFileResponseDTO] })
	async delete(@Query('keys') keys: string[]) {
		await Promise.all(keys.map(key => this.fileService.checkFile(key, true)))

		return await this.fileService.delete(keys)
	}
}
