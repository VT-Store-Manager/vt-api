import { Slide, SlideSchema } from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { SlideController } from './slide.controller'
import { SlideService } from './slide.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Slide.name, schema: SlideSchema }]),
	],
	controllers: [SlideController],
	providers: [SlideService],
})
export class SlideModule {}
