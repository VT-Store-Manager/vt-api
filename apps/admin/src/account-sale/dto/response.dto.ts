import { AccountSale, UpdatedBy } from '@app/database'
import { OmitType } from '@nestjs/swagger'

export class AccountSaleListPagination {
	totalCount: number
	items: AccountSaleListItem[]
}

export class AccountSaleListItem {
	id: string
	username: string
	store: StoreOfAccountSale
	updatedBy?: UpdatedBy
	createdAt: Date
	updatedAt: Date
}

export class StoreOfAccountSale {
	id: string
	name: string
	image: string
}

export class NewAccountSaleDTO extends OmitType(AccountSale, [
	'password',
] as const) {}
