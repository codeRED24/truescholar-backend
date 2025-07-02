import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtCmsAuthGuard extends AuthGuard("jwt-cms") {
  canActivate(context: ExecutionContext) {
    // Custom logic can be added here if needed
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException("Access Denied: Invalid Token.");
    }
    return user;
  }
}
