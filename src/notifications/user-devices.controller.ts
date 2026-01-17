import { Controller, Post, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { UserDevicesService } from "./user-devices.service";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User } from "../authentication_module/better-auth/decorators/auth.decorators";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications/devices")
@UseGuards(AuthGuard)
export class UserDevicesController {
  constructor(private readonly userDevicesService: UserDevicesService) {}

  @Post()
  @ApiOperation({ summary: "Register a device token for push notifications" })
  async registerDevice(@User() user: { id: string }, @Body() body: { token: string; deviceType?: string }) {
    return this.userDevicesService.registerDevice(user.id, body.token, body.deviceType);
  }

  @Delete(":token")
  @ApiOperation({ summary: "Unregister a device token" })
  async removeDevice(@User() user: { id: string }, @Param("token") token: string) {
    return this.userDevicesService.removeDevice(user.id, token);
  }
}
