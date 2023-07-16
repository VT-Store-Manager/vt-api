import { IsJSON } from 'class-validator'

import { ApiPropertyMultiFiles } from '@app/common'

export class UploadMultiFileDTO {
	@ApiPropertyMultiFiles()
	files: any[]

	@IsJSON()
	path: string[] = []
}
