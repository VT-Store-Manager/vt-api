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
import { UploadFileResponseDto, UploadFileDto } from './dto/upload-file.dto'
import { UploadMultiFileDto } from './dto/upload-multi-file.dto'
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
	@ApiResponse({ type: UploadFileResponseDto })
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Body(FormDataPipe<UploadFileDto>) dto: UploadFileDto
	) {
		const key = this.fileService.createObjectKey(dto.path, file.originalname)
		return await this.fileService.upload(file.buffer, key)
	}

	@Post('upload-multi')
	@UseInterceptors(FilesInterceptor('files', 6, ImageMulterOption()))
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ type: [UploadFileResponseDto] })
	async uploadMultiFiles(
		@UploadedFiles() files: Express.Multer.File[],
		@Body(FormDataPipe<UploadMultiFileDto>) dto: UploadMultiFileDto
	) {
		const keys = files.map(file =>
			this.fileService.createObjectKey(dto.path, file.originalname)
		)
		return await this.fileService.uploadMulti(files, keys)
	}

	@Put('override')
	@UseInterceptors(FileInterceptor('file', ImageMulterOption()))
	@ApiConsumes('multipart/form-data')
	@ApiBody({ type: UploadFileDto })
	@ApiResponse({ type: UploadFileResponseDto })
	async override(
		@UploadedFile() file: Express.Multer.File,
		@Body('key', S3KeyPipe) key: string
	) {
		return await this.fileService.overrideFile(file.buffer, key)
	}

	@Get('render')
	async render(@Query('key', S3KeyPipe) key: string, @Res() res: Response) {
		const fileBody = await this.fileService.getFile(key)
		res.setHeader('Content-Type', 'image/png')
		res.setHeader('Cache-Control', 'public, max-age=600')
		res.write(fileBody, 'binary')
		res.end(null, 'binary')
	}

	@Delete('delete')
	@ApiResponse({ type: [UploadFileResponseDto] })
	async delete(@Query('keys') keys: string[]) {
		return await this.fileService.delete(keys)
	}
}
