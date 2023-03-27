import { Member, MemberSchema } from '@/schemas/member.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
	],
	controllers: [],
	providers: [],
	exports: [],
})
export class MemberModule {}
