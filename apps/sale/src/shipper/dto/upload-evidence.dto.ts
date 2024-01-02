import { ApiPropertyFile } from '@app/common'

export class UploadEvidenceDTO {
	image: string
	orderId: string
	shipperId: string
}

export class UploadEvidenceBodyDTO {
	@ApiPropertyFile()
	image?: any
}
