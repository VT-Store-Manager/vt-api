import { SuccessResponseDTO } from '@/types/http.swagger'
import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger'

/**
 * It creates a decorator that adds a successful response to the swagger docs
 * @param {DataDTO} dataDTO - The DTO that will be used to validate the response data.
 * @param [statusCode=200] - The HTTP status code of the response.
 * @param [isArray=false] - If the response is an array of dataDTO, set this to true.
 */
export const ApiSuccessResponse = <DataDTO extends Type<unknown>>(
	dataDTO: DataDTO,
	statusCode = 200,
	isArray = false
) =>
	applyDecorators(
		ApiExtraModels(SuccessResponseDTO, dataDTO),
		ApiResponse({
			status: statusCode,
			schema: {
				allOf: [
					{ $ref: getSchemaPath(SuccessResponseDTO) },
					{
						properties: {
							data: isArray
								? {
										type: 'array',
										items: { $ref: getSchemaPath(dataDTO) },
								  }
								: {
										$ref: getSchemaPath(dataDTO),
								  },
						},
					},
				],
			},
		})
	)
