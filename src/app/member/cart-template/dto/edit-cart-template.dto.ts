import { PartialType, PickType } from '@nestjs/swagger'

import { CreateCartTemplateDTO } from './create-cart-template.dto'

export class EditCartTemplateDTO extends PartialType(
	PickType(CreateCartTemplateDTO, ['name', 'products'] as const)
) {}
