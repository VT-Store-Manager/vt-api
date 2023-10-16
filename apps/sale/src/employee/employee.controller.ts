import { Controller, Get } from '@nestjs/common'
import { EmployeeService } from './employee.service'
import { CurrentUser, JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, Role } from '@app/common'
import { EmployeeItemDTO } from './dto/response.dto'
import { ApiTags } from '@nestjs/swagger'

@Controller('sale/employee')
@ApiTags('sale-app / employee')
export class EmployeeController {
	constructor(private readonly employeeService: EmployeeService) {}

	@Get()
	@JwtAccess(Role.SALESPERSON)
	@ApiSuccessResponse(EmployeeItemDTO, 200, true)
	async getStoreEmployees(@CurrentUser('sub') storeId: string) {
		return await this.employeeService.getStoreEmployees(storeId)
	}
}
