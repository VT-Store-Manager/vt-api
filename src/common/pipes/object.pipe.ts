import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'

@Injectable()
export class NotEmptyObjectPipe implements PipeTransform {
	transform(value: Record<string, any>) {
		if (
			Object.values(value).filter(v => v !== undefined && v !== null).length
		) {
			return value
		}
		throw new BadRequestException('Param object must be not empty')
	}
}
