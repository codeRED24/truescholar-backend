import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtCmsStrategy extends PassportStrategy(Strategy, "jwt-cms") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from Authorization header
      ignoreExpiration: false, // Reject expired tokens
      secretOrKey: process.env.JWT_CMS_ACCESS_TOKEN_SECRET, // Secret for verifying the token
    });
  }

  async validate(payload: { userId: string; role: string }) {
    if (!payload || !payload.userId || !payload.role) {
      throw new UnauthorizedException("Invalid token.");
    }
    return payload; // Attach payload to the request object (req.user)
  }
}
