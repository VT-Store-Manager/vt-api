import { GetOrderDetailDTO } from '@sale/src/order/dto/response.dto'

export type OrderStatusUpdatedDTO = Pick<
	GetOrderDetailDTO,
	'id' | 'statusId' | 'timeLog'
>
