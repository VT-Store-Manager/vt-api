import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'

export default (size = 2): MulterOptions => ({
	limits: {
		fileSize: size * 1024 * 1024,
	},
	fileFilter(
		req: any,
		file: Express.Multer.File,
		callback: (error: Error | null, acceptFile: boolean) => void
	) {
		if (!file.mimetype.includes('image')) {
			req.fileValidationError = 'Only image file allowed'
			return callback(null, false)
		}
		callback(null, true)
	},
})
