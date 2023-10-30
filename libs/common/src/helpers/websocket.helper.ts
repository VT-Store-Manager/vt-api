import { Role } from '../constants'

export const getClientRoom = (role: Role, id: string) => {
	if (role === Role.MEMBER) return getMemberRoom(id)
	else if (role === Role.SHIPPER) return getShipperRoom(id)
	else if (role === Role.SALESPERSON) return getStoreRoom(id)
	else if (role === Role.ADMIN) return getAdminRoom(id)
	return `${role}:${id}`
}
export const getStoreRoom = (id: string) => `${Role.SALESPERSON}:${id}`
export const getMemberRoom = (id: string) => `${Role.MEMBER}:${id}`
export const getShipperRoom = (id: string) => `${Role.SHIPPER}:${id}`
export const getAdminRoom = (id: string) => `${Role.ADMIN}:${id}`
