import { ApiPropertyFile } from '@/common/decorators/file-swagger.decorator'

export class UploadFileDto {
	@ApiPropertyFile()
	file: any
}

export class UploadFileResponseDto {
	key: string
}
