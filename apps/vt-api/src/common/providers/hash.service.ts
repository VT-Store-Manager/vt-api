import * as bcrypt from 'bcrypt'

import { Injectable } from '@nestjs/common'

@Injectable()
export class HashService {
	hash(password: string): string {
		const saltRounds = 10
		return bcrypt.hashSync(password, saltRounds)
	}

	compare(password: string, hash: string): boolean {
		return bcrypt.compareSync(password, hash)
	}
}
