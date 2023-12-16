import { Model } from 'mongoose'

import { SettingType } from '@app/common'
import { SettingSaleApp, SettingSaleAppDocument } from '@app/database'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class SettingSaleService {
	constructor(
		@InjectModel(SettingType.SALE_APP)
		public readonly settingSaleModel: Model<SettingSaleAppDocument>
	) {}

	async getData<T = SettingSaleApp>(project: Record<string, any>) {
		const setting = await this.settingSaleModel
			.aggregate<T>([
				{
					$project: {
						...project,
					},
				},
			])
			.exec()
		if (!setting || setting.length === 0) {
			throw new InternalServerErrorException('Setting sale app not found')
		}
		return setting[0]
	}
}
