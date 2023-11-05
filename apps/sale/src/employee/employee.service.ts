import { Model, Types } from 'mongoose'

import { FileService } from '@app/common'
import { Employee, EmployeeDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { EmployeeItemDTO } from './dto/response.dto'

@Injectable()
export class EmployeeService {
	constructor(
		@InjectModel(Employee.name)
		private readonly employeeModel: Model<EmployeeDocument>,
		private readonly fileService: FileService
	) {}

	async getStoreEmployees(storeId: string) {
		return this.employeeModel
			.aggregate<EmployeeItemDTO>([
				{
					$match: {
						store: new Types.ObjectId(storeId),
					},
				},
				{
					$project: {
						id: { $toString: '$_id' },
						_id: false,
						name: true,
						avatar: this.fileService.getImageUrlExpression('$avatar'),
					},
				},
			])
			.exec()
	}
}
