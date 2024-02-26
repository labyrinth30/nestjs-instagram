import { RolesEnum } from '../const/roles.const';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'user_roles';

// @Roles(RolesEnum.ADMIN)
// 어드민만 사용할 수 있게 적용
export const Roles = (role: RolesEnum) => SetMetadata(ROLES_KEY, role);