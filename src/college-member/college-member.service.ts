import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../authentication_module/better-auth/entities/member.entity";
import { CollegeInfo } from "../college/college-info/college-info.entity";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { CollegeRole } from "../common/enums";

@Injectable()
export class CollegeMemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(CollegeInfo)
    private collegeRepository: Repository<CollegeInfo>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /**
   * Add a user as a member of a college
   */
  async addMember(
    collegeId: number,
    userId: string,
    role: CollegeRole
  ): Promise<Member> {
    // Verify college exists
    const college = await this.collegeRepository.findOne({
      where: { college_id: collegeId },
    });
    if (!college) {
      throw new NotFoundException(`College with ID ${collegeId} not found`);
    }

    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if membership already exists
    const existingMember = await this.memberRepository.findOne({
      where: { collegeId, userId },
    });
    if (existingMember) {
      throw new ConflictException(
        `User ${userId} is already a member of college ${collegeId}`
      );
    }

    // Create new membership
    const member = this.memberRepository.create({
      id: crypto.randomUUID(),
      collegeId,
      userId,
      role,
    });

    return this.memberRepository.save(member);
  }

  /**
   * Remove a member from a college
   */
  async removeMember(collegeId: number, userId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { collegeId, userId },
    });

    if (!member) {
      throw new NotFoundException(
        `Membership not found for user ${userId} in college ${collegeId}`
      );
    }

    await this.memberRepository.remove(member);
  }

  /**
   * Update a member's role
   */
  async updateRole(
    collegeId: number,
    userId: string,
    newRole: CollegeRole
  ): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { collegeId, userId },
    });

    if (!member) {
      throw new NotFoundException(
        `Membership not found for user ${userId} in college ${collegeId}`
      );
    }

    member.role = newRole;
    return this.memberRepository.save(member);
  }

  /**
   * Get all members of a college
   */
  async getMembersByCollege(collegeId: number): Promise<Member[]> {
    return this.memberRepository.find({
      where: { collegeId },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Get a specific membership
   */
  async getMembership(
    collegeId: number,
    userId: string
  ): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { collegeId, userId },
      relations: ["user", "college"],
    });
  }

  /**
   * Get all college memberships for a user
   */
  async getMembershipsByUser(userId: string): Promise<Member[]> {
    return this.memberRepository.find({
      where: { userId },
      relations: ["college"],
      order: { createdAt: "DESC" },
    });
  }
}
