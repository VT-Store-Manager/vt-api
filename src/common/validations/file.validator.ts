import { BadRequestException } from '@nestjs/common'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'

export const ImageMulterOption = (size = 2): MulterOptions => ({
	limits: {
		fileSize: size * 1024 * 1024,
	},
	fileFilter(
		req: any,
		file: Express.Multer.File,
		callback: (error: Error | null, acceptFile: boolean) => void
	) {
		if (!file.mimetype.includes('image')) {
			return callback(new BadRequestException('Only image file allowed'), false)
		}
		callback(null, true)
	},
})
