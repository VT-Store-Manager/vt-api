import { Employee, EmployeeDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { EmployeeItemDTO } from './dto/response.dto'

@Injectable()
export class EmployeeService {
	private imageUrl: string
	constructor(
		@InjectModel(Employee.name)
		private readonly employeeModel: Model<EmployeeDocument>,
		private readonly configService: ConfigService
	) {
		this.imageUrl = configService.get<string>('imageUrl')
	}

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
						avatar: { $concat: [this.imageUrl, '$avatar'] },
					},
				},
			])
			.exec()
	}
}
