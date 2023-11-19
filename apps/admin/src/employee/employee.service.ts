import { SoftDeleteModel } from 'mongoose-delete'

import { Employee, EmployeeDocument, Store, StoreDocument } from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ClientSession, Types } from 'mongoose'
import { CreateEmployeeDTO } from './dto/create-employee.dto'
import { QueryEmployeeListDTO } from './dto/query-employee-list.dto'
import { EmployeeListItem, EmployeeListPaginationDTO } from './dto/response.dto'

@Injectable()
export class EmployeeService {
	constructor(
		@InjectModel(Employee.name)
		private readonly employeeModel: SoftDeleteModel<EmployeeDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: SoftDeleteModel<StoreDocument>
	) {}

	async createEmployee(
		data: CreateEmployeeDTO,
		session?: ClientSession
	): Promise<Employee> {
		await this.storeModel
			.findOne({ _id: new Types.ObjectId(data.store) })
			.orFail(new BadRequestException('Store of employee not found'))
			.lean()
			.exec()

		const [employee] = await this.employeeModel.create(
			[
				{
					...data,
					avatar: typeof data.avatar === 'string' ? data.avatar : '',
					dob: new Date(data.dob),
				},
			],
			session ? { session } : {}
		)

		return employee
	}

	async getEmployeeList(
		query: QueryEmployeeListDTO
	): Promise<EmployeeListPaginationDTO> {
		const [allEmployees, employees] = await Promise.all([
			this.storeModel
				.aggregate<{ employees: any[] }>([
					{
						$lookup: {
							from: 'employees',
							localField: '_id',
							foreignField: 'store',
							as: 'employees',
							pipeline: [
								{
									$match: {
										deleted: {
											$ne: true,
										},
									},
								},
								{
									$project: {
										_id: true,
									},
								},
							],
						},
					},
					{
						$project: {
							employees: true,
							_id: false,
						},
					},
				])
				.exec(),
			this.employeeModel
				.aggregate<EmployeeListItem>([
					{
						$project: {
							id: { $toString: '$_id' },
							_id: false,
							store: true,
							phone: true,
							name: true,
							avatar: true,
							gender: true,
							dob: true,
							createdAt: true,
							updatedAt: true,
						},
					},
					...(query.sortBy
						? [
								{
									$sort: {
										[query.sortBy.replace(/^(-|\+)+/, '')]:
											query.sortBy.startsWith('-') ? -1 : 1,
									},
								} as any,
						  ]
						: []),
					{
						$skip: (query.page - 1) * query.limit,
					},
					{
						$limit: query.limit,
					},
				])
				.exec(),
		])

		return {
			totalCount: allEmployees.reduce(
				(sum, store) => sum + store.employees.length,
				0
			),
			items: employees,
		}
	}

	async softDeleteEmployee(employeeId: string, adminId: string) {
		const deleteResult = await this.employeeModel.delete(
			{ _id: new Types.ObjectId(employeeId) },
			new Types.ObjectId(adminId)
		)
		return deleteResult
	}
}
