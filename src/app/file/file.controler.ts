import { Response } from 'express'

import imageMulterOption from '@/common/validations/file.validator'
import {
	Controller,
	Delete,
	Get,
	Param,
	ParseArrayPipe,
	Post,
	Query,
	Res,
	UploadedFile,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'

import { FileService } from './file.service'
import { S3KeyValidationPipe } from '@/common/pipes/s3-key.pipe'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('file')
@Controller({
	path: 'file',
	version: '1',
})
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file', imageMulterOption()))
	async uploadFile(@UploadedFile() file: Express.Multer.File) {
		return await this.fileService.upload(
			file.buffer,
			['product'],
			file.originalname
		)
	}

	@Post('upload-multi')
	@UseInterceptors(FilesInterceptor('files', 6, imageMulterOption()))
	async uploadMultiFiles(@UploadedFiles() files: Express.Multer.File[]) {
		return await this.fileService.uploadMulti(files, ['store'])
	}

	@Delete('delete')
	async delete(
		@Query('keys', new ParseArrayPipe({ items: String, separator: ',' }))
		keys: string[]
	) {
		return await this.fileService.delete(keys)
	}

	@Get('render')
	async render(@Query('key') key: string, @Res() res: Response) {
		const file = await this.fileService.getFile(key)
		res.setHeader('Content-Type', 'image/png')
		res.setHeader('Cache-Control', 'public, max-age=600')
		res.write(file.Body, 'binary')
		res.end(null, 'binary')
	}

	@Post(':key/override')
	@UseInterceptors(FileInterceptor('file', imageMulterOption()))
	async override(
		@UploadedFile() file: Express.Multer.File,
		@Param('key', S3KeyValidationPipe) key: string
	) {
		return await this.fileService.overrideFile(file.buffer, key)
	}
}
