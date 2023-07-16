import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class FormDataPipe<T extends Record<string, any>>
	implements PipeTransform<T>
{
	transform(value: T, _metadata: ArgumentMetadata) {
		Object.keys(value).forEach(key => {
			let transformedValue = value[key]
			if (typeof transformedValue !== 'string') return
			if (
				(transformedValue.startsWith('[') && transformedValue.endsWith(']')) ||
				(transformedValue.startsWith('{') && transformedValue.endsWith('}'))
			)
				transformedValue = JSON.parse(transformedValue)
			value[key as keyof T] = transformedValue
		})

		return value
	}
}
