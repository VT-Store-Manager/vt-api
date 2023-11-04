import { Types } from 'mongoose'
import { Role } from '../constants'

export const getClientRoom = (role: Role, id: string | Types.ObjectId) => {
	if (role === Role.MEMBER) return getMemberRoom(id)
	else if (role === Role.SHIPPER) return getShipperRoom(id)
	else if (role === Role.SALESPERSON) return getStoreRoom(id)
	else if (role === Role.ADMIN) return getAdminRoom(id)
	return `${role}:${id.toString()}`
}
export const getStoreRoom = (id: string | Types.ObjectId) =>
	`${Role.SALESPERSON}:${id.toString()}`
export const getMemberRoom = (id: string | Types.ObjectId) =>
	`${Role.MEMBER}:${id.toString()}`
export const getShipperRoom = (id: string | Types.ObjectId) =>
	`${Role.SHIPPER}:${id.toString()}`
export const getAdminRoom = (id: string | Types.ObjectId) =>
	`${Role.ADMIN}:${id.toString()}`
