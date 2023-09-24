/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, UnauthorizedException, mixin } from '@nestjs/common';

export const AuthorizedGuard =(allowedRoles:string[]) =>{
 class RolesGuardMixin implements CanActivate {
canActivate(context: ExecutionContext): boolean {
  const request = context.switchToHttp().getRequest();
  const result = request?.user?.roles.map((role:string)=>allowedRoles.includes(role)).find((val:boolean)=>val===true)
  if(result)return true
  throw new UnauthorizedException('Sorry, You Are Not Authorized')
}
}
const guard =mixin(RolesGuardMixin)
return guard
}