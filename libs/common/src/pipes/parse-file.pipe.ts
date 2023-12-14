import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common'

@Injectable()
export class ParseFile implements PipeTransform {
	transform(
		files: Express.Multer.File | Express.Multer.File[]
	): Express.Multer.File | Express.Multer.File[] {
		if (files === undefined || files === null) {
			throw new BadRequestException('Image expected')
		}

		if (Array.isArray(files) && files.length === 0) {
			throw new BadRequestException('Images expected')
		}

		return files
	}
}

@Injectable()
export class ParseFileOptional implements PipeTransform {
	transform(
		files: Express.Multer.File | Express.Multer.File[]
	): Express.Multer.File | Express.Multer.File[] {
		if (files === undefined || files === null) {
			throw new BadRequestException('Image expected')
		}

		return files
	}
}

@Injectable()
export class ParseFileField implements PipeTransform {
	constructor(private readonly fields: string[]) {
		this.fields = fields
	}

	transform(
		files: Record<string, Express.Multer.File | Express.Multer.File[]>
	): Record<string, Express.Multer.File | Express.Multer.File[]> {
		const invalidFields = this.fields.filter(field => {
			if (!files[field] || (Array.isArray(files) && files.length === 0))
				return true
			return false
		})
		if (invalidFields.length > 0) {
			throw new BadRequestException(
				`${invalidFields.join(', ')} image${
					invalidFields.length > 1 ? 's are' : ' is'
				} required`
			)
		}

		return files
	}
}
