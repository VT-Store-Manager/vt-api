// Variables
export const RANK_MESSAGE_SPLIT = '|'
export const IS_ZERO_POINT_MESSAGE = 'Chưa tích điểm.'
export const DEFAULT_POINT_NAME = 'BEAN'
export const DEFAULT_MAX_CART_TEMPLATE = 10

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
	GENERAL = 'setting_general',
	ADMIN_APP = 'setting_admin_app',
	SALE_APP = 'setting_sale_app',
	MEMBER_APP = 'setting_member_app',
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

export enum PaymentType {
	CAST,
	MOMO,
}

export enum OrderBuyer {
	CUSTOMER = 'order_customer',
	MEMBER = 'order_member',
}

export enum StoreCriterion {
	SERVICE,
	PRODUCT,
	APPLICATION,
	SPACE,
}

export enum OrderState {
	PROCESSING = 'processing',
	DONE = 'done',
	CANCELED = 'canceled',
}

export enum NotificationType {
	OTHER = -1,
	ORDER,
	VOUCHER,
	PROMOTION,
}
