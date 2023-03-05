import { ApiPropertyMultiFiles } from '@/common/decorators/file-swagger.decorator'

export class UploadMultiFileDto {
	@ApiPropertyMultiFiles()
	files: any[]
}
