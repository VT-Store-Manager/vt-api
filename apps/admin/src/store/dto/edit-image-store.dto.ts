import { ApiPropertyMultiFiles } from '@app/common'
import { IsArray, IsOptional } from 'class-validator'

export class EditImageStoreDTO {
	@ApiPropertyMultiFiles()
	@IsOptional()
	files?: any[] = []

	@IsOptional()
	@IsArray()
	imageMap?: string[] = []
}
