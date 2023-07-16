import { Module } from '@nestjs/common'

import { FileController } from './file.controler'
import { FileService } from './file.service'

@Module({
	imports: [],
	controllers: [FileController],
	providers: [FileService],
	exports: [FileService],
})
export class FileModule {}
