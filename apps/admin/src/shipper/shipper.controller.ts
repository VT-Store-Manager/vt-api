import { ApiSuccessResponse, FileService, ParseFile } from '@app/common'
import { MongoSessionService, Shipper } from '@app/database'
import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'
import { CreateShipperDTO } from './dto/create-shipper.dto'
import { ShipperService } from './shipper.service'

@Controller('admin/shipper')
@ApiTags('admin-app > shipper')
export class ShipperController {
	constructor(
		private readonly shipperService: ShipperService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image'))
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(Shipper, 201)
	async createShipper(
		@UploadedFile(ParseFile) image: Express.Multer.File,
		@Body() body: CreateShipperDTO
	) {
		let imageKey = ''
		if (image) {
			imageKey = this.fileService.createObjectKey(
				['shipper'],
				image.originalname
			)
		}
		body.avatar = imageKey
		let result: Shipper
		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const [_, shipper] = await Promise.all([
					image
						? this.fileService.upload(image.buffer, imageKey, abortController)
						: null,
					this.shipperService.createShipper(body, session),
				])

				result = shipper
			}
		)
		if (error) {
			abortController.abort()
			this.fileService.delete([imageKey])
			throw error
		}

		return result
	}
}
