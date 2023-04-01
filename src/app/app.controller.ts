import { Controller, Get } from '@nestjs/common'
import {
	ApiBadRequestResponse,
	getSchemaPath,
	ApiExtraModels,
} from '@nestjs/swagger'
import {
	CommonErrorResponseDTO,
	ValidationErrorResponseDTO,
} from '@/types/http.swagger'

@Controller({ version: '1' })
@ApiExtraModels(CommonErrorResponseDTO, ValidationErrorResponseDTO)
@ApiBadRequestResponse({
	schema: {
		oneOf: [
			{
				$ref: getSchemaPath(CommonErrorResponseDTO),
				description: 'Common error',
			},
			{
				$ref: getSchemaPath(ValidationErrorResponseDTO),
				description: 'Validation data error',
			},
		],
	},
})
export class AppController {
	@Get()
	getHello() {}
}
