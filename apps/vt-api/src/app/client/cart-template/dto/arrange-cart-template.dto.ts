import { Transform } from 'class-transformer'
import { ArrayMinSize, IsArray, IsMongoId } from 'class-validator'
import { uniq } from 'lodash'

export class ArrangeCartTemplateDTO {
	@IsArray()
	@ArrayMinSize(1)
	@IsMongoId({ each: true })
	@Transform(({ value }: { value: string[] }) => uniq(value))
	newOrder: string[]
}
