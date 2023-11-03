import { GetOrderDetailDTO } from '@sale/src/order/dto/response.dto'
import { AuthenticateClientDTO } from '@websocket/connection/dto/authenticate-client.dto'
import { OrderDataDTO } from '@websocket/namespaces/member/order/dto/order-data.dto'
import { OrderStatusChangedDTO } from '@websocket/namespaces/member/order/dto/order-status-changed.dto'
import { ShippingOrderDataDTO } from '@websocket/namespaces/member/order/dto/shipping-order-data.dto'

// Common namespace
export type CommonEventMap = {
	['error']: (error: Error) => void
	['authenticate']: (dto: AuthenticateClientDTO) => void
	['check_authenticated']: () => void
}
export type CommonEventNames = keyof CommonEventMap

// Member namespace
export type MemberEventMap = {
	['error']: (error: Error) => void
	['member:new_order']: (dto: OrderDataDTO) => void
	['member:cancel_order']: (dto: OrderDataDTO) => void
	['member:paid_order']: (dto: OrderDataDTO) => void
}
export type MemberEventNames = keyof MemberEventMap

// Store namespace
export type StoreEventMap = {
	['error']: (error: Error) => void
	['store:new_order']: (dto: GetOrderDetailDTO) => void
	['store:cancelled_order']: (dto: OrderDataDTO) => void
	['store:order_status_change']: (dto: OrderStatusChangedDTO) => void
}
export type StoreEventNames = keyof StoreEventMap

// Shipper namespace
export type ShipperEventMap = {
	['error']: (error: Error) => void
	['shipper:new_order']: (dto: ShippingOrderDataDTO) => void
	['shipper:cancelled_order']: (dto: OrderDataDTO) => void
}
export type ShipperEventNames = keyof ShipperEventMap

// All events
export type AllEventMap = CommonEventMap &
	MemberEventMap &
	StoreEventMap &
	ShipperEventMap
export type AllEventNames = keyof AllEventMap
