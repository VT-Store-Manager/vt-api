import {
	ApiSuccessResponse,
	FileService,
	ImageMulterOption,
	ParseFileField,
} from '@app/common'
import { MongoSessionService, Rank } from '@app/database'
import {
	Body,
	Controller,
	Get,
	Post,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'

import { CreateRankDTO } from './dto/create-rank.dto'
import { RankItemDTO } from './dto/response.dto'
import { RankService } from './rank.service'

@Controller('admin/rank')
@ApiTags('admin-app > rank')
export class RankController {
	constructor(
		private readonly rankService: RankService,
		private readonly mongoSessionService: MongoSessionService,
		private readonly fileService: FileService
	) {}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: 'icon', maxCount: 1 },
				{ name: 'background', maxCount: 1 },
			],
			ImageMulterOption(2, 2)
		)
	)
	@ApiConsumes('multipart/form-data')
	async createNewRank(
		@UploadedFiles(new ParseFileField(['icon', 'background']))
		files: Record<'icon' | 'background', Express.Multer.File[]>,
		@Body() body: CreateRankDTO
	) {
		const iconObjectKey = this.fileService.createObjectKey(
			['rank'],
			files.icon[0].originalname
		)
		const backgroundObjectKey = this.fileService.createObjectKey(
			['rank'],
			files.background[0].originalname
		)
		let result: Rank
		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const createResult = await Promise.all([
					this.rankService.createNewRank(
						{
							icon: iconObjectKey,
							background: backgroundObjectKey,
							color: body.color,
						},
						body,
						session
					),
					this.fileService.uploadMulti(
						[files.icon[0], files.background[0]],
						[iconObjectKey, backgroundObjectKey],
						abortController
					),
				])
				result = createResult[0]
			}
		)
		if (error) {
			abortController.abort()
			this.fileService.delete([iconObjectKey, backgroundObjectKey])

			throw error
		}

		return result
	}

	@Get()
	@ApiSuccessResponse(RankItemDTO, 200, true)
	async getRankList() {
		return await this.rankService.getList()
	}
}
