import { Module } from '@nestjs/common'
import { GoogleMapService } from './google-map.service'

@Module({
	providers: [GoogleMapService],
	exports: [GoogleMapService],
})
export class GoogleMapModule {}
