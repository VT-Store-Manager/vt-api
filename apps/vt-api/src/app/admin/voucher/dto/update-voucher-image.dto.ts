import { ApiPropertyFile } from '@/common/decorators/file-swagger.decorator'

export class UpdateVoucherImageDTO {
	@ApiPropertyFile()
	image: any
}
