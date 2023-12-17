import {
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	IsUrl,
	Matches,
	Min,
	Validate,
} from 'class-validator'

import { FinishTimeRule } from '@app/common'
import { Voucher } from '@app/database'
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger'

import { CreateVoucherDTO } from './create-voucher.dto'

export class UpdateVoucherInfoDTO extends PartialType(
	IntersectionType(CreateVoucherDTO, PickType(Voucher, ['expireHour'] as const))
) {
	@IsOptional()
	@IsString()
	image?: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	title?: string

	@IsOptional()
	@IsString()
	@Matches(/^[a-zA-Z0-9]+$/)
	code?: string

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsPositive()
	expireHour?: number

	@IsOptional()
	@IsNumber()
	@Min(new Date(2023, 0, 1).getTime())
	activeStartTime?: number

	@IsOptional()
	@IsNumber()
	@Min(new Date(2023, 0, 1).getTime())
	@Validate(FinishTimeRule)
	activeFinishTime?: number
}
