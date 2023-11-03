import { GetOrderDetailDTO } from '@sale/src/order/dto/response.dto'

export type OrderStatusChangedDTO = Pick<
	GetOrderDetailDTO,
	'id' | 'statusId' | 'timeLog'
>
