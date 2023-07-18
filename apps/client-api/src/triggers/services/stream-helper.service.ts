import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class StreamHelperService {
	public static readonly logger = new Logger('ChangeStream', {
		timestamp: true,
	})
}
