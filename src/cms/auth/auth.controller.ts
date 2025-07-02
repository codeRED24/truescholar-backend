import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import {
  CreateUserDto,
  LoginUserDto,
  UserIdDto,
  UpdateUserDto,
  PaginationDto,
  RefreshTokenDto,
} from "./dto/auth.dto";
import AuthService from "./auth.service";
import { JwtCmsAuthGuard } from "./jwt.cmsAuth.guard";
import { RolesGuard } from "./utils/roles.guard";
import { Roles } from "./utils/roles.decorator";

@Controller("cms-auth")
export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  Login(@Body(ValidationPipe) user: LoginUserDto) {
    return this.authService.login(user.email, user.password);
  }

  @Post("refresh-token")
  RefreshToken(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokenHandler(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtCmsAuthGuard, RolesGuard)
  @Roles("admin") // Only admins can create users
  @Post("create-user")
  CreateUser(@Body(ValidationPipe) user: CreateUserDto, @Req() req: any) {
    const user_id = req.user?.userId;
    return this.authService.createUser(user, user_id);
  }

  @UseGuards(JwtCmsAuthGuard, RolesGuard)
  @Roles("admin") // Only admins can create users
  @Delete("/delete-user/:userId")
  DeleteUser(@Param() param: UserIdDto) {
    return this.authService.deleteUser(param.userId);
  }

  @UseGuards(JwtCmsAuthGuard, RolesGuard)
  @Roles("admin") // Only admins can create users
  @Put("/update-user/:userId")
  UpdateUser(
    @Param() param: UserIdDto,
    @Body(ValidationPipe) user: UpdateUserDto
  ) {
    return this.authService.updateUser(param.userId, user);
  }

  @UseGuards(JwtCmsAuthGuard, RolesGuard)
  @Roles("admin") // Only admins can create users
  @Get("users")
  GetAllUsers(@Query() query: PaginationDto) {
    const { page = 1, limit = 10, role, name } = query;
    return this.authService.findAll(page || 1, limit || 10, role, name);
  }

  @UseGuards(JwtCmsAuthGuard)
  @Get("profile-details")
  GetProfileDetail(@Req() req: any) {
    const user_id = req.user?.userId;
    return this.authService.getProfileDetail(user_id);
  }
}
