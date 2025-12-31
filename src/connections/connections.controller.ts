import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User } from "../authentication_module/better-auth/decorators/auth.decorators";
import { ConnectionsService } from "./connections.service";
import {
  ConnectionsQueryDto,
  SendConnectionRequestDto,
} from "./connection.dto";

@ApiTags("Connections")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("connections")
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post("request")
  @ApiOperation({ summary: "Send a connection request" })
  async sendRequest(
    @User() user: { id: string },
    @Body() dto: SendConnectionRequestDto
  ) {
    const connection = await this.connectionsService.sendRequest(
      user.id,
      dto.addresseeId
    );
    return {
      id: connection.id,
      status: connection.status,
      createdAt: connection.createdAt,
    };
  }

  @Post(":id/accept")
  @ApiOperation({ summary: "Accept a connection request" })
  async acceptRequest(
    @User() user: { id: string },
    @Param("id") connectionId: string
  ) {
    await this.connectionsService.acceptRequest(connectionId, user.id);
    return { success: true };
  }

  @Post(":id/reject")
  @ApiOperation({ summary: "Reject a connection request" })
  async rejectRequest(
    @User() user: { id: string },
    @Param("id") connectionId: string
  ) {
    await this.connectionsService.rejectRequest(connectionId, user.id);
    return { success: true };
  }

  @Delete(":id/cancel")
  @ApiOperation({ summary: "Cancel a sent connection request" })
  async cancelRequest(
    @User() user: { id: string },
    @Param("id") connectionId: string
  ) {
    await this.connectionsService.cancelRequest(connectionId, user.id);
    return { success: true };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove a connection" })
  async removeConnection(
    @User() user: { id: string },
    @Param("id") connectionId: string
  ) {
    await this.connectionsService.removeConnection(connectionId, user.id);
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: "Get user connections" })
  async getConnections(
    @User() user: { id: string },
    @Query() query: ConnectionsQueryDto
  ) {
    const connections = await this.connectionsService.getConnections(
      user.id,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
    return connections.map((conn) => ({
      id: conn.id,
      status: conn.status,
      createdAt: conn.createdAt,
      otherUser: conn.otherUser,
    }));
  }

  @Get("pending")
  @ApiOperation({ summary: "Get pending connection requests received" })
  async getPendingRequests(
    @User() user: { id: string },
    @Query() query: ConnectionsQueryDto
  ) {
    const connections = await this.connectionsService.getPendingRequests(
      user.id,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
    return connections.map((conn) => ({
      id: conn.id,
      status: conn.status,
      createdAt: conn.createdAt,
      otherUser: conn.otherUser,
    }));
  }

  @Get("sent")
  @ApiOperation({ summary: "Get sent connection requests" })
  async getSentRequests(
    @User() user: { id: string },
    @Query() query: ConnectionsQueryDto
  ) {
    const connections = await this.connectionsService.getSentRequests(
      user.id,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
    return connections.map((conn) => ({
      id: conn.id,
      status: conn.status,
      createdAt: conn.createdAt,
      otherUser: conn.otherUser,
    }));
  }

  @Get("count")
  @ApiOperation({ summary: "Get connection count" })
  async getConnectionCount(@User() user: { id: string }) {
    const count = await this.connectionsService.getConnectionCount(user.id);
    return { count };
  }

  @Get("status/:userId")
  @ApiOperation({ summary: "Get connection status with another user" })
  async getConnectionStatus(
    @User() user: { id: string },
    @Param("userId") otherUserId: string
  ) {
    return this.connectionsService.getConnectionStatus(user.id, otherUserId);
  }
}
