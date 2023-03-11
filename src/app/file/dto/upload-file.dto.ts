import { ApiPropertyFile } from '@/common/decorators/file-swagger.decorator'
import { IsJSON } from 'class-validator'

export class UploadFileDto {
	@ApiPropertyFile()
	file?: any

	@IsJSON()
	path: Array<string>
}

export class UploadFileResponseDto {
	key: string
}
