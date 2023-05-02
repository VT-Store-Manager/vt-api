import { Model } from 'mongoose'

import { SettingType } from '@/common/constants'
import { SettingGeneralDocument } from '@/schemas/setting-general.schema'
import { SettingMemberApp } from '@/schemas/setting-member-app.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class SettingMemberAppService {
	constructor(
		@InjectModel(SettingType.MEMBER_APP)
		private readonly settingMemberAppModel: Model<SettingGeneralDocument>
	) {}

	async getData<T = SettingMemberApp>(project: Record<string, any>) {
		const setting = await this.settingMemberAppModel
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
