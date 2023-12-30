import { Module } from '@nestjs/common'
import { GoogleMapService } from './google-map.service'

@Module({
	providers: [GoogleMapService],
})
export class GoogleMapModule {}
