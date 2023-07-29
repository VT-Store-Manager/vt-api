import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Post,
} from '@nestjs/common'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('login')
	async loginUser(@Body('phone') phone: string) {
		if (!phone) throw new BadRequestException('Member not found')
		const user = await this.userService.getUserInfo(phone)
		return user.name.toLowerCase().replace(/\s+/g, '_')
	}

	@Get('info')
	async getUserData() {
		const users = await this.userService.getAllUsers()
		return users.map(user => ({
			...user,
			id: user.name.toLowerCase().replace(/\s+/g, '_'),
		}))
	}
}
