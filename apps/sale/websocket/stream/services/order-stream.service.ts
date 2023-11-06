import { isEqual } from 'lodash'
import { ChangeStreamDocument, ChangeStreamUpdateDocument } from 'mongodb'
import { Model } from 'mongoose'

import { ChangeStreamLogger, getMemberRoom, OrderBuyer } from '@app/common'
import { OrderMember, OrderMemberDocument } from '@app/database'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ConnectionProvider } from '@websocket/connection/connection.provider'
import { OrderStatusUpdatedDTO } from '@websocket/order/dto/order-status-changed.dto'

@Injectable()
export class OrderStreamService implements OnModuleInit {
	constructor(
		@InjectModel(OrderBuyer.MEMBER)
		private readonly orderMemberModel: Model<OrderMemberDocument>,
		private readonly connectionProvider: ConnectionProvider
	) {}

	onModuleInit() {
		const stream = this.orderMemberModel.watch(
			[
				{
					$match: {
						$and: [
							{ operationType: 'update' },
							{
								$or: [
									{ 'fullDocument.buyer': OrderBuyer.MEMBER },
									{ 'fullDocumentBeforeChange.buyer': OrderBuyer.MEMBER },
								],
							},
						],
					},
				},
				{
					$project: {
						ns: true,
						operationType: true,
						documentKey: true,
						updateDescription: true,
						fullDocument: {
							_id: true,
							store: true,
							member: true,
							shipper: true,
							state: true,
							timeLog: true,
						},
						fullDocumentBeforeChange: {
							state: true,
							timeLog: true,
						},
					},
				},
			],
			{
				fullDocumentBeforeChange: 'whenAvailable',
				fullDocument: 'updateLookup',
			}
		)

		ChangeStreamLogger.debug('Order stream watching...')
		stream.on('change', (data: ChangeStreamDocument) => {
			const updateData = data as ChangeStreamUpdateDocument<OrderMemberDocument>

			if (!updateData.fullDocument) return

			this.updateOrderStatus(
				updateData.fullDocumentBeforeChange,
				updateData.fullDocument
			)
		})
	}

	private async updateOrderStatus(preData: OrderMember, postData: OrderMember) {
		const getOrderStatus = (
			data: OrderMember
		): Pick<OrderStatusUpdatedDTO, 'statusId' | 'timeLog'> => {
			return {
				statusId: data.state,
				timeLog: data.timeLog.map(log => {
					return {
						...log,
						time: log.time.getTime(),
					}
				}),
			}
		}

		const preOrderStatus = getOrderStatus(preData)
		const postOrderStatus = getOrderStatus(postData)

		if (isEqual(preOrderStatus, postOrderStatus)) return

		ChangeStreamLogger.verbose(
			`Order of ${postData.member.id.toString()} status updated`,
			`${JSON.stringify(preOrderStatus)} -> ${JSON.stringify(postOrderStatus)}`
		)
		this.connectionProvider
			.getMemberNsp()
			.to(getMemberRoom(postData.member.id))
			.emit('member-user:order_status_updated', {
				id: postData._id.toString(),
				...postOrderStatus,
			})
	}
}
