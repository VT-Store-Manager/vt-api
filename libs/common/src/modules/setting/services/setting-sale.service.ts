import { Model } from 'mongoose'

import {
	COST_PER_KM,
	INIT_COST,
	INIT_DISTANCE,
	MAX_DISTANCE,
	SettingType,
} from '@app/common'
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

	calculateShipperIncome(distance: number, _time?: Date) {
		const maxCost = INIT_COST + (MAX_DISTANCE - INIT_DISTANCE) * COST_PER_KM

		if (distance <= INIT_DISTANCE) return INIT_COST

		const additionCost =
			Math.floor((distance - INIT_DISTANCE) / 1000) * COST_PER_KM
		return Math.min(INIT_COST + additionCost, maxCost)
	}
}
