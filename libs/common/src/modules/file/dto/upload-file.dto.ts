import { ApiPropertyFile } from '@app/common'
import { ArrayMinSize, IsArray, IsString } from 'class-validator'

export class UploadFileDTO {
	@ApiPropertyFile()
	file?: any

	@IsArray()
	@ArrayMinSize(1)
	@IsString({ each: true })
	path: Array<string>
}

export class UploadFileResponseDTO {
	key: string
}
