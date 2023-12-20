import {
	ArrayMinSize,
	IsMongoId,
	IsOptional,
	IsString,
	Matches,
} from 'class-validator'

export class CreateAccountAdminDTO {
	@IsString()
	@Matches(/[a-zA-Z0-9_.-]{3,}/)
	username: string

	@IsString()
	name: string

	@IsOptional()
	@IsMongoId({ each: true })
	@ArrayMinSize(1)
	roles?: string[] = []

	@IsOptional()
	@IsMongoId({ each: true })
	stores?: string[] = []
}
