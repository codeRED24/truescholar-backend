import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { LinkRequestService } from "./link-request.service";
import { CreateLinkRequestDto } from "./dto";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { PoliciesGuard, CheckPolicies } from "../casl";

@ApiTags("College Link Requests")
@Controller("colleges")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class LinkRequestController {
  constructor(private readonly linkRequestService: LinkRequestService) {}

  @Post(":collegeId/link-request")
  @ApiOperation({ summary: "Request to be linked to a college" })
  @ApiResponse({ status: 201, description: "Request created or auto-approved" })
  async createLinkRequest(
    @Param("collegeId", ParseIntPipe) collegeId: number,
    @Body() dto: CreateLinkRequestDto,
    @Req() req: any
  ) {
    return this.linkRequestService.createLinkRequest(
      req.user.id,
      collegeId,
      dto
    );
  }

  @Get(":collegeId/link-requests")
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: "manage", subject: "Member" })
  @ApiOperation({ summary: "List pending link requests (College Admin)" })
  @ApiResponse({ status: 200, description: "List of pending requests" })
  async getPendingRequests(
    @Param("collegeId", ParseIntPipe) collegeId: number
  ) {
    return this.linkRequestService.getPendingRequests(collegeId);
  }

  @Post(":collegeId/link-requests/:requestId/approve")
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: "manage", subject: "Member" })
  @ApiOperation({ summary: "Approve a link request (College Admin)" })
  @ApiResponse({ status: 200, description: "Request approved, member created" })
  async approveRequest(@Param("requestId") requestId: string, @Req() req: any) {
    return this.linkRequestService.approveRequest(requestId, req.user.id);
  }

  @Post(":collegeId/link-requests/:requestId/reject")
  @UseGuards(PoliciesGuard)
  @CheckPolicies({ action: "manage", subject: "Member" })
  @ApiOperation({ summary: "Reject a link request (College Admin)" })
  @ApiResponse({ status: 200, description: "Request rejected" })
  async rejectRequest(@Param("requestId") requestId: string, @Req() req: any) {
    return this.linkRequestService.rejectRequest(requestId, req.user.id);
  }
}
