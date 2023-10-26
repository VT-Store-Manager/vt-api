import { SoftDeleteModel } from 'mongoose-delete'

import { Employee, EmployeeDocument, Store, StoreDocument } from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ClientSession, Types } from 'mongoose'
import { CreateEmployeeDTO } from './dto/create-employee.dto'

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
}
