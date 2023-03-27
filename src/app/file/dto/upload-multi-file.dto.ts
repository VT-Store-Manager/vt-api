import { ApiPropertyMultiFiles } from '@/common/decorators/file-swagger.decorator'
import { IsJSON } from 'class-validator'

export class UploadMultiFileDTO {
	@ApiPropertyMultiFiles()
	files: any[]

	@IsJSON()
	path: string[] = []
}
