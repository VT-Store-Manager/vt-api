import { Document } from 'mongoose'

import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { OmitType } from '@nestjs/swagger'

import { Order } from './order.schema'

export type OrderCustomerDocument = OrderCustomer & Document

@Schema({ versionKey: false })
export class OrderCustomer extends OmitType(Order, ['buyer'] as const) {
	buyer: string
}

export const OrderCustomerSchema = SchemaFactory.createForClass(OrderCustomer)
