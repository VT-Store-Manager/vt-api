import { FileService } from '@app/common'
import {
	Employee,
	EmployeeSchema,
	MongoSessionService,
	Store,
	StoreSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { EmployeeController } from './employee.controller'
import { EmployeeService } from './employee.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Employee.name, schema: EmployeeSchema },
			{ name: Store.name, schema: StoreSchema },
		]),
	],
	controllers: [EmployeeController],
	providers: [EmployeeService, FileService, MongoSessionService],
})
export class EmployeeModule {}
