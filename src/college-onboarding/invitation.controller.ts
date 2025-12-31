import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  NotFoundException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Invitation } from "../authentication_module/better-auth/entities/invitation.entity";
import { Member } from "../authentication_module/better-auth/entities/member.entity";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { CollegeRole } from "../common/enums";

@ApiTags("Invitations")
@Controller("invitations")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class InvitationController {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>
  ) {}

  @Get("pending")
  @ApiOperation({ summary: "Get pending invitations for current user" })
  @ApiResponse({ status: 200, description: "List of pending invitations" })
  async getPendingInvitations(@Req() req: any) {
    const userEmail = req.user.email;
    return this.invitationRepository.find({
      where: { email: userEmail, status: "pending" },
      relations: ["college"],
      order: { createdAt: "DESC" },
    });
  }

  @Post(":id/accept")
  @ApiOperation({ summary: "Accept an invitation" })
  @ApiResponse({
    status: 200,
    description: "Invitation accepted, linked to college",
  })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  async acceptInvitation(@Param("id") id: string, @Req() req: any) {
    const invitation = await this.invitationRepository.findOne({
      where: { id, email: req.user.email },
    });

    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new NotFoundException("Invitation is no longer valid");
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = "expired";
      await this.invitationRepository.save(invitation);
      throw new NotFoundException("Invitation has expired");
    }

    // Update invitation status
    invitation.status = "accepted";
    await this.invitationRepository.save(invitation);

    // Create membership
    const member = this.memberRepository.create({
      id: crypto.randomUUID(),
      userId: req.user.id,
      collegeId: invitation.collegeId,
      role: (invitation.role as CollegeRole) || CollegeRole.STUDENT,
    });

    await this.memberRepository.save(member);

    return { message: "Invitation accepted", member };
  }

  @Post(":id/reject")
  @ApiOperation({ summary: "Reject an invitation" })
  @ApiResponse({ status: 200, description: "Invitation rejected" })
  async rejectInvitation(@Param("id") id: string, @Req() req: any) {
    const invitation = await this.invitationRepository.findOne({
      where: { id, email: req.user.email },
    });

    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    invitation.status = "rejected";
    await this.invitationRepository.save(invitation);

    return { message: "Invitation rejected" };
  }
}
