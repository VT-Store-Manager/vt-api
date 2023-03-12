import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import {
	ApiBadRequestResponse,
	getSchemaPath,
	ApiExtraModels,
} from '@nestjs/swagger'
import {
	CommonErrorResponseDto,
	ValidationErrorResponseDto,
} from '@/types/http.swagger'

@Controller({ version: '1' })
@ApiExtraModels(CommonErrorResponseDto, ValidationErrorResponseDto)
@ApiBadRequestResponse({
	schema: {
		oneOf: [
			{
				$ref: getSchemaPath(CommonErrorResponseDto),
				description: 'Common error',
			},
			{
				$ref: getSchemaPath(ValidationErrorResponseDto),
				description: 'Validation data error',
			},
		],
	},
})
export class AppController {
	@Get()
	getHello() {}
}
