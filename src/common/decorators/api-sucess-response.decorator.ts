import { SuccessResponseDto } from '@/types/http.swagger'
import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger'

/**
 * It creates a decorator that adds a successful response to the swagger docs
 * @param {DataDto} dataDto - The DTO that will be used to validate the response data.
 * @param [statusCode=200] - The HTTP status code of the response.
 * @param [isArray=false] - If the response is an array of dataDto, set this to true.
 */
export const ApiSuccessResponse = <DataDto extends Type<unknown>>(
	dataDto: DataDto,
	statusCode = 200,
	isArray = false
) =>
	applyDecorators(
		ApiExtraModels(SuccessResponseDto, dataDto),
		ApiResponse({
			status: statusCode,
			schema: {
				allOf: [
					{ $ref: getSchemaPath(SuccessResponseDto) },
					{
						properties: {
							data: isArray
								? {
										type: 'array',
										items: { $ref: getSchemaPath(dataDto) },
								  }
								: {
										$ref: getSchemaPath(dataDto),
								  },
						},
					},
				],
			},
		})
	)
