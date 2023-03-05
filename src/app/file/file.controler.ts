import { Response } from 'express'

import { S3KeyValidationPipe } from '@/common/pipes/s3-key.pipe'
import imageMulterOption from '@/common/validations/file.validator'
import {
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

import { FileService } from './file.service'
import { UploadFileResponseDto, UploadFileDto } from './dto/upload-file.dto'
import { UploadMultiFileDto } from './dto/upload-multi-file.dto'

@ApiTags('file')
@Controller({
	path: 'file',
	version: '1',
})
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file', imageMulterOption()))
	@ApiConsumes('multipart/form-data')
	@ApiBody({ type: UploadFileDto })
	@ApiResponse({ type: UploadFileResponseDto })
	async uploadFile(@UploadedFile() file: Express.Multer.File) {
		return await this.fileService.upload(file.buffer, [], file.originalname)
	}

	@Post('upload-multi')
	@UseInterceptors(FilesInterceptor('files', 6, imageMulterOption()))
	@ApiConsumes('multipart/form-data')
	@ApiBody({ type: UploadMultiFileDto })
	@ApiResponse({ type: [UploadFileResponseDto] })
	async uploadMultiFiles(@UploadedFiles() files: Express.Multer.File[]) {
		return await this.fileService.uploadMulti(files, [])
	}

	@Put('override/:key')
	@UseInterceptors(FileInterceptor('file', imageMulterOption()))
	@ApiConsumes('multipart/form-data')
	@ApiBody({ type: UploadFileDto })
	@ApiResponse({ type: UploadFileResponseDto })
	async override(
		@UploadedFile() file: Express.Multer.File,
		@Param('key', S3KeyValidationPipe) key: string
	) {
		return await this.fileService.overrideFile(file.buffer, key)
	}

	@Get('render/:key')
	async render(
		@Param('key', S3KeyValidationPipe) key: string,
		@Res() res: Response
	) {
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
