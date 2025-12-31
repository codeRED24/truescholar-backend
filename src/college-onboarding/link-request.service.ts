import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  CollegeLinkRequest,
  LinkRequestStatus,
} from "./entities/college-link-request.entity";
import { Member } from "../authentication_module/better-auth/entities/member.entity";
import { CollegeInfo } from "../college/college-info/college-info.entity";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { CollegeRole } from "../common/enums";
import { CreateLinkRequestDto } from "./dto";

@Injectable()
export class LinkRequestService {
  constructor(
    @InjectRepository(CollegeLinkRequest)
    private linkRequestRepository: Repository<CollegeLinkRequest>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(CollegeInfo)
    private collegeRepository: Repository<CollegeInfo>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /**
   * Create a link request for a user to join a college
   */
  async createLinkRequest(
    userId: string,
    collegeId: number,
    dto: CreateLinkRequestDto
  ): Promise<CollegeLinkRequest | Member> {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Check if college exists
    const college = await this.collegeRepository.findOne({
      where: { college_id: collegeId },
    });
    if (!college) {
      throw new NotFoundException("College not found");
    }

    // Check if already a member
    const existingMember = await this.memberRepository.findOne({
      where: { userId, collegeId },
    });
    if (existingMember) {
      throw new ConflictException("User is already a member of this college");
    }

    // Check for existing pending request
    const existingRequest = await this.linkRequestRepository.findOne({
      where: { userId, collegeId, status: LinkRequestStatus.PENDING },
    });
    if (existingRequest) {
      throw new ConflictException("A pending request already exists");
    }

    // Check if email domain matches for auto-approval
    if (user.emailVerified && college.emailDomains?.length) {
      const userDomain = "@" + user.email.split("@")[1];
      const domainMatches = college.emailDomains.some(
        (domain) => domain.toLowerCase() === userDomain.toLowerCase()
      );

      if (domainMatches) {
        // Auto-approve: create member directly
        const member = this.memberRepository.create({
          id: crypto.randomUUID(),
          userId,
          collegeId,
          role: dto.role,
        });
        return this.memberRepository.save(member);
      }
    }

    // Create pending request
    const linkRequest = this.linkRequestRepository.create({
      id: crypto.randomUUID(),
      userId,
      collegeId,
      status: LinkRequestStatus.PENDING,
      requestedRole: dto.role,
      enrollmentYear: dto.enrollmentYear,
      graduationYear: dto.graduationYear,
    });

    return this.linkRequestRepository.save(linkRequest);
  }

  /**
   * Get pending link requests for a college
   */
  async getPendingRequests(collegeId: number): Promise<CollegeLinkRequest[]> {
    return this.linkRequestRepository.find({
      where: { collegeId, status: LinkRequestStatus.PENDING },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Approve a link request
   */
  async approveRequest(requestId: string, reviewerId: string): Promise<Member> {
    const request = await this.linkRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException("Link request not found");
    }

    if (request.status !== LinkRequestStatus.PENDING) {
      throw new ConflictException("Request has already been reviewed");
    }

    // Update request status
    request.status = LinkRequestStatus.APPROVED;
    request.reviewedAt = new Date();
    request.reviewedBy = reviewerId;
    await this.linkRequestRepository.save(request);

    // Create member
    const member = this.memberRepository.create({
      id: crypto.randomUUID(),
      userId: request.userId,
      collegeId: request.collegeId,
      role: request.requestedRole as CollegeRole,
    });

    return this.memberRepository.save(member);
  }

  /**
   * Reject a link request
   */
  async rejectRequest(
    requestId: string,
    reviewerId: string
  ): Promise<CollegeLinkRequest> {
    const request = await this.linkRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException("Link request not found");
    }

    if (request.status !== LinkRequestStatus.PENDING) {
      throw new ConflictException("Request has already been reviewed");
    }

    request.status = LinkRequestStatus.REJECTED;
    request.reviewedAt = new Date();
    request.reviewedBy = reviewerId;

    return this.linkRequestRepository.save(request);
  }
}
