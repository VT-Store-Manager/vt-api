import { CartTemplate } from '@app/database'
import { PickType } from '@nestjs/swagger'

export class CreateCartTemplateResponseDTO {
	id: string
}

export class GetAllCartTemplateResponseDTO {
	limit: number
	cartTemplate: CartTemplateItemDTO[]
}

export class CartTemplateItemDTO extends PickType(CartTemplate, [
	'name',
	'index',
	'products',
] as const) {
	id: string
}

export class EditCartTemplateResultDTO extends PickType(CartTemplate, [
	'name',
	'products',
] as const) {}
