import { CurrentAdmin } from '@admin/authentication/decorators/current-admin.decorator'
import { JwtAccess } from '@admin/authentication/decorators/jwt.decorator'
import {
	ApiSuccessResponse,
	FileService,
	ObjectIdPipe,
	ParseFile,
} from '@app/common'
import {
	AccountAdmin,
	MongoSessionService,
	Shipper,
	UpdatedBy,
} from '@app/database'
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'

import { CreateShipperDTO } from './dto/create-shipper.dto'
import { QueryShipperListDTO } from './dto/query-shipper-list.dto'
import { ShipperListPagination } from './dto/response.dto'
import { ShipperService } from './shipper.service'

@Controller('admin/shipper')
@ApiTags('admin-app > shipper')
@JwtAccess()
export class ShipperController {
	constructor(
		private readonly shipperService: ShipperService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('avatar'))
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(Shipper, 201)
	async createShipper(
		@UploadedFile(ParseFile) avatarImage: Express.Multer.File,
		@Body() body: CreateShipperDTO,
		@CurrentAdmin('adminData') adminData: AccountAdmin
	) {
		let imageKey = ''
		if (avatarImage) {
			imageKey = this.fileService.createObjectKey(
				['shipper'],
				avatarImage.originalname
			)
		}
		body.avatar = imageKey
		let result: Shipper
		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const updatedBy: UpdatedBy = {
					accountId: adminData._id,
					accountUsername: adminData.username,
					time: new Date(),
				}
				const [_, shipper] = await Promise.all([
					avatarImage
						? this.fileService.upload(
								avatarImage.buffer,
								imageKey,
								abortController
						  )
						: null,
					this.shipperService.createShipper(body, updatedBy, session),
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

	@Get('list')
	@ApiSuccessResponse(ShipperListPagination)
	async getShipperListPagination(@Query() query: QueryShipperListDTO) {
		return await this.shipperService.getShipperListPagination(query)
	}

	@Delete(':id')
	async deleteShipper(
		@Param('id', ObjectIdPipe) deleteId: string,
		@CurrentAdmin('sub') adminId: string
	) {
		return await this.shipperService.deleteShipper(deleteId, adminId)
	}
}
