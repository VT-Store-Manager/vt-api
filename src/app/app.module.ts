import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'

@Module({
	imports: [MongooseModule.forRoot('mongodb://127.0.0.1:27017/vt'), UserModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
