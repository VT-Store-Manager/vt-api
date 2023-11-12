export class AccountSaleListPagination {
	totalCount: number
	items: AccountSaleListItem[]
}

export class AccountSaleListItem {
	id: string
	username: string
	store: StoreOfAccountSale
	createdAt: Date
	updatedAt: Date
}

export class StoreOfAccountSale {
	id: string
	name: string
	image: string
}
