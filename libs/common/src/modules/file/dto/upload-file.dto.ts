import { ApiPropertyFile } from '@app/common'
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator'

export class UploadFileDTO {
	@ApiPropertyFile()
	@IsNotEmpty()
	file?: any

	@IsArray()
	@ArrayMinSize(1)
	@IsString({ each: true })
	path: Array<string>
}

export class UploadFileResponseDTO {
	key: string
}
