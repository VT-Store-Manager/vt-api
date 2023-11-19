import { CurrentAdmin } from '@admin/authentication/decorators/current-admin.decorator'
import {
	ApiSuccessResponse,
	FileService,
	ObjectIdPipe,
	ParseFile,
} from '@app/common'
import { Employee, MongoSessionService } from '@app/database'
import { BooleanResponseDTO } from '@app/types'
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateEmployeeDTO } from './dto/create-employee.dto'
import { QueryEmployeeListDTO } from './dto/query-employee-list.dto'
import { EmployeeListPaginationDTO } from './dto/response.dto'
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
	@UseInterceptors(FileInterceptor('avatar'))
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(Employee, 201)
	async createEmployee(
		@UploadedFile(ParseFile) avatarImage: Express.Multer.File,
		@Body() body: CreateEmployeeDTO
	) {
		let imageKey = ''
		if (avatarImage) {
			imageKey = this.fileService.createObjectKey(
				['employee'],
				avatarImage.originalname
			)
		}
		body.avatar = imageKey
		let result: Employee
		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const [_, employee] = await Promise.all([
					avatarImage
						? this.fileService.upload(
								avatarImage.buffer,
								imageKey,
								abortController
						  )
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

	@Get('list')
	@ApiSuccessResponse(EmployeeListPaginationDTO)
	async getEmployeeList(@Query() query: QueryEmployeeListDTO) {
		return await this.employeeService.getEmployeeList(query)
	}

	@Delete(':id')
	@ApiResponse({ type: BooleanResponseDTO })
	async softDeleteEmployee(
		@Param('id', ObjectIdPipe) employeeId: string,
		@CurrentAdmin('sub') adminId: string
	) {
		return await this.employeeService.softDeleteEmployee(employeeId, adminId)
	}
}
