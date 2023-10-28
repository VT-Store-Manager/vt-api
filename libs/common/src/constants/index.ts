// Variables
export const RANK_MESSAGE_SPLIT = '|'
export const IS_ZERO_POINT_MESSAGE = 'Chưa tích điểm.'
export const DEFAULT_POINT_NAME = 'BEAN'
export const DEFAULT_MAX_CART_TEMPLATE = 10
export const DAY_DURATION = 1000 * 60 * 60 * 24

// Pattern
export const cronTimePattern =
	/^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$/

export const s3KeyPattern =
	/^([a-zA-Z0-9_-]+\/){0,}[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}(.[a-z]+)?$/

export const keyCodePattern = /^[A-Z0-9]+$/

export const adminPasswordPattern =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#\$%^&\*\_,\.\?])[A-Za-z\d~!@#\$%^&\*\_,\.\?]{8,}$/

export const vnPhoneNumberPattern = /^(((\+?84)|0)[235789])([0-9]{8})$/g

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

export enum StatusText {
	ACTIVE = 'active',
	DISABLED = 'disabled',
	REMOVED = 'removed',
}

export enum PublishStatus {
	NOT_YET,
	OPENING,
	CLOSED,
}

export enum Role {
	MEMBER = 'member',
	ADMIN = 'admin',
	SALESPERSON = 'salesperson',
	SHIPPER = 'shipper',
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
	SERVICE = 'service',
	PRODUCT = 'product',
	APPLICATION = 'application',
	SPACE = 'space',
}

export enum OrderState {
	PENDING = 'pending',
	PROCESSING = 'processing',
	DONE = 'done',
	CANCELED = 'canceled',
}

export enum ShipperOrderState {
	TOOK_AWAY = 1,
	DELIVERED = 2,
}

export enum NotificationType {
	OTHER = -1,
	ORDER,
	VOUCHER,
	PROMOTION,
}

export enum ErrorCode {
	MONGO_DUPLICATED = 11000,
}

export enum SortOrder {
	ASC,
	DESC,
}

export enum RangeTimeType {
	DAY = 'day',
	WEEK = 'week',
	MONTH = 'month',
	QUARTER = 'quarter',
	YEAR = 'year',
}

export enum QueryTime {
	EVERY_TIME,
	TODAY,
	WEEK,
	MONTH,
}
