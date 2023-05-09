import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import {
	NotEmptyObjectPipe,
	RemoveNullishObjectPipe,
} from '@/common/pipes/object.pipe'
import { ParseFile } from '@/common/pipes/parse-file.pipe'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { BooleanResponseDTO } from '@/types/swagger'
import { CurrentUser } from '@module/auth/decorators/current-user.decorator'
import { FileService } from '@module/file/file.service'
import {
	Body,
	Controller,
	Delete,
	InternalServerErrorException,
	Param,
	Patch,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateVoucherDTO } from './dto/create-voucher.dto'
import { UpdateVoucherConditionDTO } from './dto/update-voucher-condition.dto'
import { UpdateVoucherDiscountDTO } from './dto/update-voucher-discount.dto'
import { UpdateVoucherImageDTO } from './dto/update-voucher-image.dto'
import { UpdateVoucherInfoDTO } from './dto/update-voucher-info.dto'
import { VoucherAdminService } from './voucher_admin.service'

@Controller({
	path: 'admin/voucher',
	version: '1',
})
@ApiTags('admin-app > voucher')
// TODO: Turn on authen admin
// @JwtAccess(Role.ADMIN)
export class VoucherAdminController {
	constructor(
		private readonly voucherAdminService: VoucherAdminService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async createVoucher(@Body() body: CreateVoucherDTO) {
		const voucher = await this.voucherAdminService.create(body)
		return !!voucher
	}

	@Patch(':id/info')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateVoucherInfo(
		@Param('id', ObjectIdPipe) voucherId: string,
		@Body(RemoveNullishObjectPipe, NotEmptyObjectPipe)
		body: UpdateVoucherInfoDTO
	) {
		return await this.voucherAdminService.updateInfo(voucherId, body)
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
		const voucher = await this.voucherAdminService.getDetail(voucherId, 'image')

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
						this.voucherAdminService.updateInfo(
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
			throw new InternalServerErrorException(error.message)
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
		return await this.voucherAdminService.updateDiscount(voucherId, body)
	}

	@Patch(':id/condition')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateVoucherCondition(
		@Param('id', ObjectIdPipe) voucherId: string,
		@Body(RemoveNullishObjectPipe, NotEmptyObjectPipe)
		body: UpdateVoucherConditionDTO
	) {
		return await this.voucherAdminService.updateCondition(voucherId, body)
	}

	@Patch(':id/slider')
	@UseInterceptors(FileInterceptor('image', ImageMulterOption(2, 1)))
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async updateVoucherSlider(
		@UploadedFile(ParseFile) image: Express.Multer.File,
		@Param('id', ObjectIdPipe) voucherId: string
	) {
		const voucher = await this.voucherAdminService.getDetail(voucherId, 'image')

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
						['voucher', 'slider'],
						image.originalname
					)
					await Promise.all([
						this.fileService.upload(
							image.buffer,
							voucherImageKey,
							abortController
						),
						this.voucherAdminService.updateInfo(
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
			throw new InternalServerErrorException(error.message)
		}
		return true
	}

	@Patch(':id/disable')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async disableVoucher(@Param('id') voucherId: string) {
		return await this.voucherAdminService.updateInfo(voucherId, {
			disabled: true,
		})
	}

	@Patch(':id/enable')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async enableVoucher(@Param('id') voucherId: string) {
		return await this.voucherAdminService.updateInfo(voucherId, {
			disabled: false,
		})
	}

	@Delete(':id/delete')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async deleteVoucher(
		@CurrentUser('sub') memberId: string,
		@Param('id') voucherId: string
	) {
		return await this.voucherAdminService.softDelete(voucherId, memberId)
	}

	@Patch(':id/restore')
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async restoreVoucher(@Param('id') voucherId: string) {
		return await this.voucherAdminService.restore(voucherId)
	}
}
