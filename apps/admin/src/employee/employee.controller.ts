import { ApiSuccessResponse, FileService, ParseFile } from '@app/common'
import { Employee, MongoSessionService, Shipper } from '@app/database'
import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'

import { CreateEmployeeDTO } from './dto/create-employee.dto'
import { EmployeeService } from './employee.service'

@Controller('admin/employee')
@ApiTags('admin-app > employee')
export class EmployeeController {
	constructor(
		private readonly employeeService: EmployeeService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image'))
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(Shipper, 201)
	async createEmployee(
		@UploadedFile(ParseFile) image: Express.Multer.File,
		@Body() body: CreateEmployeeDTO
	) {
		let imageKey = ''
		if (image) {
			imageKey = this.fileService.createObjectKey(
				['employee'],
				image.originalname
			)
		}
		body.avatar = imageKey
		let result: Employee
		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const [_, employee] = await Promise.all([
					image
						? this.fileService.upload(image.buffer, imageKey, abortController)
						: null,
					this.employeeService.createEmployee(body, session),
				])

				result = employee
			}
		)
		if (error) {
			abortController.abort()
			this.fileService.delete([imageKey])
			throw error
		}

		return result
	}
}
