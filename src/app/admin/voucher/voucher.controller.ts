import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import {
	NotEmptyObjectPipe,
	RemoveNullishObjectPipe,
} from '@/common/pipes/object.pipe'
import { ParseFile } from '@/common/pipes/parse-file.pipe'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { BooleanResponseDTO } from '@/types/swagger'
import { FileService } from '@module/file/file.service'
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateVoucherDTO } from './dto/create-voucher.dto'
import { GetVoucherPaginationDTO } from './dto/get-voucher-pagination.dto'
import { GetVoucherListDTO } from './dto/response.dto'
import { UpdateVoucherConditionDTO } from './dto/update-voucher-condition.dto'
import { UpdateVoucherDiscountDTO } from './dto/update-voucher-discount.dto'
import { UpdateVoucherImageDTO } from './dto/update-voucher-image.dto'
import { UpdateVoucherInfoDTO } from './dto/update-voucher-info.dto'
import { UpdateVoucherSliderDTO } from './dto/update-voucher-slider.dto'
import { VoucherService } from './voucher.service'

@Controller({
	path: 'admin/voucher',
	version: '1',
})
@ApiTags('admin-app > voucher')
// TODO: Turn on authen admin
// @JwtAccess(Role.ADMIN)
export class VoucherController {
	constructor(
		private readonly voucherService: VoucherService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async createVoucher(@Body() body: CreateVoucherDTO) {
		const voucher = await this.voucherService.create(body)
		return !!voucher
	}

	@Patch(':id/info')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateVoucherInfo(
		@Param('id', ObjectIdPipe) voucherId: string,
		@Body(RemoveNullishObjectPipe, NotEmptyObjectPipe)
		body: UpdateVoucherInfoDTO
	) {
		return await this.voucherService.updateInfo(voucherId, body)
	}

	@Patch(':id/image')
	@UseInterceptors(FileInterceptor('image', ImageMulterOption(2, 1)))
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateVoucherImage(
		@UploadedFile(ParseFile) image: Express.Multer.File,
		@Param('id', ObjectIdPipe) voucherId: string,
		@Body() _body: UpdateVoucherImageDTO
	) {
		const voucher = await this.voucherService.getDetail(voucherId, 'image')

		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				if (voucher.image) {
					await this.fileService.overrideFile(
						image.buffer,
						voucher.image,
						abortController
					)
				} else {
					const voucherImageKey = this.fileService.createObjectKey(
						['voucher'],
						image.originalname
					)
					await Promise.all([
						this.fileService.upload(
							image.buffer,
							voucherImageKey,
							abortController
						),
						this.voucherService.updateInfo(
							voucherId,
							{ image: voucherImageKey },
							session
						),
					])
				}
			}
		)
		if (error) {
			abortController.abort()
			throw error
		}
		return true
	}

	@Patch(':id/discount')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateVoucherDiscount(
		@Param('id', ObjectIdPipe) voucherId: string,
		@Body(RemoveNullishObjectPipe, NotEmptyObjectPipe)
		body: UpdateVoucherDiscountDTO
	) {
		return await this.voucherService.updateDiscount(voucherId, body)
	}

	@Patch(':id/condition')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateVoucherCondition(
		@Param('id', ObjectIdPipe) voucherId: string,
		@Body(RemoveNullishObjectPipe, NotEmptyObjectPipe)
		body: UpdateVoucherConditionDTO
	) {
		return await this.voucherService.updateCondition(voucherId, body)
	}

	@Patch(':id/slider')
	@UseInterceptors(FileInterceptor('image', ImageMulterOption(2, 1)))
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateVoucherSlider(
		@UploadedFile(ParseFile) image: Express.Multer.File,
		@Param('id', ObjectIdPipe) voucherId: string,
		@Body() _body: UpdateVoucherSliderDTO
	) {
		const voucher = await this.voucherService.getDetail(voucherId, 'image')

		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				if (voucher.slider) {
					await this.fileService.overrideFile(
						image.buffer,
						voucher.image,
						abortController
					)
				} else {
					const voucherImageKey = this.fileService.createObjectKey(
						['voucher', 'slider'],
						image.originalname
					)
					await Promise.all([
						this.fileService.upload(
							image.buffer,
							voucherImageKey,
							abortController
						),
						this.voucherService.updateInfo(
							voucherId,
							{ slider: voucherImageKey },
							session
						),
					])
				}
			}
		)
		if (error) {
			abortController.abort()
			throw error
		}
		return true
	}

	@Patch(':id/disable')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async disableVoucher(@Param('id') voucherId: string) {
		return await this.voucherService.updateInfo(voucherId, {
			disabled: true,
		})
	}

	@Patch(':id/enable')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async enableVoucher(@Param('id') voucherId: string) {
		return await this.voucherService.updateInfo(voucherId, {
			disabled: false,
		})
	}

	@Delete(':id/delete')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async deleteVoucher(
		@CurrentUser('sub') memberId: string,
		@Param('id') voucherId: string
	) {
		return await this.voucherService.softDelete(voucherId, memberId)
	}

	@Patch(':id/restore')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async restoreVoucher(@Param('id') voucherId: string) {
		return await this.voucherService.restore(voucherId)
	}

	@Get()
	@ApiSuccessResponse(GetVoucherListDTO)
	async getVoucherPagination(@Query() query: GetVoucherPaginationDTO) {
		return await this.voucherService.getVoucherWithPagination(query)
	}
}
