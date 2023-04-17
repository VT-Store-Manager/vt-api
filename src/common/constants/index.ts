// Variables
export const RANK_MESSAGE_SPLIT = '|'
export const IS_ZERO_POINT_MESSAGE = 'Chưa tích điểm.'
export const DEFAULT_POINT_NAME = 'BEAN'

// Enums
export enum NodeEnv {
	PRODUCTION = 'production',
	DEVELOPMENT = 'development',
}

export enum Gender {
	FEMALE,
	MALE,
	OTHER,
}

export enum Status {
	ACTIVE = 'active',
	DISABLED = 'disabled',
	REMOVED = 'removed',
}

export enum Role {
	MEMBER = 'member',
	ADMIN = 'admin',
	SALESPERSON = 'salesperson',
}

export enum SettingType {
	GENERAL = 'general',
	ADMIN_APP = 'admin_app',
	SALE_APP = 'sale_app',
	MEMBER_APP = 'member_app',
}

export enum ContactType {
	PHONE_NUMBER = 'phone_number',
	EMAIL = 'email',
	WEBSITE = 'website',
	OTHER = 'other',
}

export enum OrderStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	DELIVERY = 'delivery',
	CANCELLED = 'cancelled',
	DONE = 'done',
}

export enum ShippingMethod {
	IN_STORE,
	PICK_UP,
	DELIVERY,
	NONE = -1,
}
