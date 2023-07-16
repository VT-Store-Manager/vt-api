import { ApiPropertyFile } from '@/common/decorators/file-swagger.decorator'
import { IsJSON } from 'class-validator'

export class UploadFileDTO {
	@ApiPropertyFile()
	file?: any

	@IsJSON()
	path: Array<string>
}

export class UploadFileResponseDTO {
	key: string
}
