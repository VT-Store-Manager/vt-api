import { Model } from 'mongoose'

import { SettingType } from '@/common/constants'
import {
	SettingGeneral,
	SettingGeneralDocument,
} from '@schema/setting-general.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class SettingGeneralService {
	constructor(
		@InjectModel(SettingType.GENERAL)
		public readonly settingGeneralModel: Model<SettingGeneralDocument>
	) {}

	async getData<T = SettingGeneral>(project: Record<string, any>) {
		const setting = await this.settingGeneralModel
			.aggregate<T>([
				{
					$project: {
						...project,
					},
				},
			])
			.exec()
		if (!setting || setting.length === 0) {
			throw new BadRequestException('Setting member app not found')
		}
		return setting[0]
	}
}