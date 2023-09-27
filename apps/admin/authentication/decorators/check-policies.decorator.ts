import { PolicyHandler } from '@admin/types/casl'
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common'
import { PoliciesGuard } from '../guards/policies.guard'

export const CHECK_POLICIES_KEY = 'check_policy'
export function CheckPolicies(...handlers: PolicyHandler[]) {
	return applyDecorators(
		SetMetadata(CHECK_POLICIES_KEY, handlers),
		UseGuards(PoliciesGuard)
	)
}
