import { Member, MemberSchema } from '@/schemas/member.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthMemberController } from './controllers/auth-member.controller'
import { AuthMemberService } from './services/auth-member.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
	],
	controllers: [AuthMemberController],
	providers: [AuthMemberService],
})
export class AuthModule {}
