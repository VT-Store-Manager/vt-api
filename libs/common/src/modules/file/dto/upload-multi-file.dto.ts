import { ApiPropertyMultiFiles } from '@app/common'
import { IsJSON } from 'class-validator'

export class UploadMultiFileDTO {
	@ApiPropertyMultiFiles()
	files: any[]

	@IsJSON()
	path: string[] = []
}
