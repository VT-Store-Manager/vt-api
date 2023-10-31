import { GetOrderDetailDTO } from '@sale/src/order/dto/response.dto'
import { AuthenticateClientDTO } from '@sale/websocket/connection/dto/authenticate-client.dto'
import { MemberNewOrderDTO } from '@sale/websocket/namespaces/member/order/dto/member-new-order.dto'

// Common namespace
export type CommonEventMap = {
	['authenticate']: (dto: AuthenticateClientDTO) => void
	['check_authenticated']: () => void
}
export type CommonEventNames = keyof CommonEventMap

// Member namespace
export type MemberEventMap = {
	['member:new_order']: (dto: MemberNewOrderDTO) => void
}
export type MemberEventNames = keyof MemberEventMap

// Store namespace
export type StoreEventMap = {
	['store:new_order']: (dto: GetOrderDetailDTO) => void
}
export type StoreEventNames = keyof StoreEventMap

// Shipper namespace
export type ShipperEventMap = {
	['shipper:new_order']: (dto: GetOrderDetailDTO) => void
}
export type ShipperEventNames = keyof ShipperEventMap

// All events
export type AllEventMap = CommonEventMap &
	MemberEventMap &
	StoreEventMap &
	ShipperEventMap
export type AllEventNames = keyof AllEventMap
