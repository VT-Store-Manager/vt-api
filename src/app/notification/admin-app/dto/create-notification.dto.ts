import { Type } from 'class-transformer'
import {
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
} from 'class-validator'

import { cronTimePattern, NotificationType } from '@/common/constants'
import { ApiPropertyFile } from '@/common/decorators/file-swagger.decorator'

export class CreateNotificationDTO {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsString()
	@IsNotEmpty()
	description: string

	@ApiPropertyFile()
	image?: any

	@IsMongoId()
	targetId: string

	@IsOptional()
	@Type(() => Number)
	@IsEnum(NotificationType)
	type?: NotificationType = NotificationType.OTHER

	@IsOptional()
	@Type(() => Boolean)
	immediate?: boolean = false

	@IsOptional()
	@Matches(cronTimePattern)
	cronTime?: string
}
