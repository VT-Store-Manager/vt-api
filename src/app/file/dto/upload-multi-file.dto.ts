import { ApiPropertyMultiFiles } from '@/common/decorators/file-swagger.decorator'
import { IsJSON } from 'class-validator'

export class UploadMultiFileDto {
	@ApiPropertyMultiFiles()
	files: any[]

	@IsJSON()
	path: string[] = []
}
