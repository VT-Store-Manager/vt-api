import { Logger } from '@nestjs/common'

export const ChangeStreamLogger = new Logger('ChangeStream', {
	timestamp: true,
})

export const SocketIoLogger = new Logger('SocketIO', {
	timestamp: true,
})

export const TaskScheduleLogger = new Logger('TaskSchedule', {
	timestamp: true,
})
