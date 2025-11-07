import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  Get,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response, Request } from "express";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "../users/dto/create-users.dto";
import { RefreshAuthGuard } from "./refresh-auth.guard";
import { User } from "../../common/decorators/user.decorator";
import { UserPayload } from "../../common/interfaces/user-payload.interface";
import { ThrottlerGuard } from "@nestjs/throttler";
import { setCookies } from "../../utils/auth-helpers";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() createUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    await this.authService.signUp(createUserDto, res, req);
    return {
      message: "User created successfully",
    };
  }

  @Post("login")
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    await this.authService.login(loginUserDto, res, req);
    return {
      message: "User logged in successfully",
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    await this.authService.logout(res, req);
    return {
      message: "User logged out successfully",
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token provided");
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshTokens(refreshToken, req);

      // Set new cookies
      setCookies(res, accessToken, newRefreshToken);

      return { message: "Tokens refreshed successfully" };
    } catch (error) {
      console.log({ error });

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      throw new UnauthorizedException("Failed to refresh token");
    }
  }

  @Get("me")
  @UseGuards(RefreshAuthGuard)
  async getProfile(@User() user: UserPayload) {
    return user;
  }
}
