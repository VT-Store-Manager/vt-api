import { Gender } from '@app/common'

export class EmployeeListPaginationDTO {
	totalCount: number
	items: EmployeeListItem[]
}

export class EmployeeListItem {
	id: string
	store: string
	phone: string
	name: string
	avatar: string
	gender: Gender
	dob: Date
	createdAt: Date
	updatedAt: Date
}
