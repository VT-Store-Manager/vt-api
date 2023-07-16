import { IsJSON } from 'class-validator'

import { ApiPropertyFile } from '@app/common'

export class UploadFileDTO {
	@ApiPropertyFile()
	file?: any

	@IsJSON()
	path: Array<string>
}

export class UploadFileResponseDTO {
	key: string
}
