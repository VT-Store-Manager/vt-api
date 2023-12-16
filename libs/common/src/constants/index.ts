// Variables
export const RANK_MESSAGE_SPLIT = '|'
export const IS_ZERO_POINT_MESSAGE = 'Chưa tích điểm.'
export const DEFAULT_POINT_NAME = 'BEAN'
export const DEFAULT_MAX_CART_TEMPLATE = 10
export const DAY_DURATION = 1000 * 60 * 60 * 24
export const HTTP_HEADER_SECRET_KEY_NAME = 'http-server-ws-secret-key'

// Pattern
export const cronTimePattern =
	/^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$/

export const s3KeyPattern =
	/^([a-zA-Z0-9_-]+\/)*[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}(.[a-z]+)?$/

export const urlPattern = /^https?:\/\//

export const keyCodePattern = /^[A-Z0-9]+$/

export const adminPasswordPattern =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#\$%^&\*\_,\.\?])[A-Za-z\d~!@#\$%^&\*\_,\.\?]{8,}$/

export const vnPhoneNumberPattern = /^(((\+?84)|0)[235789])(\d{8})$/

// Enums
export enum NodeEnv {
	PRODUCTION = 'production',
	DEVELOPMENT = 'development',
}

export enum AppName {
	CLIENT = 'client',
	SALE = 'sale',
	ADMIN = 'admin',
}

export enum WsNamespace {
	MEMBER = 'member',
	STORE = 'store',
	SHIPPER = 'shipper',
	ADMIN = 'admin',
}

export enum AppVersion {
	MEMBER = '2',
	SALE = '2',
	ADMIN = '2',
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
	IN_STORE = 0,
	PICK_UP = 1,
	DELIVERY = 2,
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
	DELIVERING = 'delivering',
	DONE = 'done',
	CANCELED = 'canceled',
}

export enum ShipperOrderState {
	TOOK_AWAY = 1,
	DELIVERED = 2,
}

export enum NotificationType {
	OTHER = -1,
	ORDER = 0,
	VOUCHER = 1,
	PROMOTION = 2,
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

export enum PaymentStatus {
	PENDING = 'pending',
	FAILED = 'failed',
	SUCCESS = 'success',
}

export enum MomoResultCode {
	SUCCEEDED = 0,
	AUTHORIZED_SUCCESSFULLY = 9000,
}
