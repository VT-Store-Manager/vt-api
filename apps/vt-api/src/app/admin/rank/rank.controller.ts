import { FileService } from '@module/file/file.service'
import { ParseFileField } from '@/common/pipes/parse-file.pipe'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Rank } from '@schema/rank.schema'
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

import { RankService } from './rank.service'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { RankItemDTO } from './dto/response.dto'

@Controller({
	path: 'admin/rank',
	version: '1',
})
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
