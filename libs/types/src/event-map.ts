import { PickOrderErrorDTO } from '@websocket/order/dto/pick-order-error.dto'
import { GetOrderDetailDTO } from '@sale/src/order/dto/response.dto'
import { OrderShortDTO } from '@sale/src/shipper/dto/response.dto'
import { AuthenticateClientDTO } from '@websocket/connection/dto/authenticate-client.dto'
import { OrderDataDTO } from '@websocket/order/dto/order-data.dto'
import { OrderShipperPickedDTO } from '@websocket/order/dto/order-shipper-picked.dto'
import { OrderStatusUpdatedDTO } from '@websocket/order/dto/order-status-changed.dto'

// Common namespace
export type CommonEventMap = {
	['error']: (error: Error) => void
	['authenticate']: (dto: AuthenticateClientDTO) => void
	['check_authenticated']: () => void
	['unauthorized']: () => void
}
export type CommonEventNames = keyof CommonEventMap

// Member namespace
export type MemberEventMap = {
	['error']: (error: Error) => void
	['member-server:new_order']: (dto: OrderDataDTO) => void
	['member-server:cancel_order']: (dto: OrderDataDTO) => void
	['member-server:paid_order']: (dto: OrderDataDTO) => void
	['member-user:order_status_updated']: (dto: OrderStatusUpdatedDTO) => void
}
export type MemberEventNames = keyof MemberEventMap

// Store namespace
export type StoreEventMap = {
	['error']: (error: Error) => void
	['store:new_order']: (dto: GetOrderDetailDTO) => void
	['store:cancelled_order']: (dto: OrderDataDTO) => void
	['store:order_status_updated']: (dto: OrderStatusUpdatedDTO) => void
	['store:shipper_picked']: (dto: OrderShipperPickedDTO) => void
}
export type StoreEventNames = keyof StoreEventMap

// Shipper namespace
export type ShipperEventMap = {
	['error']: (error: Error) => void
	['shipper:new_order']: (dto: OrderShortDTO) => void
	['shipper:cancelled_order']: (dto: OrderDataDTO) => void
	['shipper:pick_order']: (dto: OrderDataDTO) => void
	['shipper:pick_order_error']: (dto: PickOrderErrorDTO) => void
	['shipper:pick_order_success']: (dto: OrderDataDTO) => void
	['shipper:remove_picked_order']: (dto: OrderDataDTO) => void
}
export type ShipperEventNames = keyof ShipperEventMap

// All events
export type AllEventMap = CommonEventMap &
	MemberEventMap &
	StoreEventMap &
	ShipperEventMap
export type AllEventNames = keyof AllEventMap
