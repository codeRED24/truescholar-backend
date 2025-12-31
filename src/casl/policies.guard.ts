import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  CaslAbilityFactory,
  UserContext,
  MemberContext,
} from "./casl-ability.factory";
import { CHECK_POLICIES_KEY, PolicyHandler } from "./check-policies.decorator";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../authentication_module/better-auth/entities/member.entity";

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler()
      ) || [];

    // If no policies defined, allow access (rely on AuthGuard for authentication)
    if (policyHandlers.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserContext;

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    // Get collegeId from route params if available
    const collegeId = request.params.collegeId
      ? parseInt(request.params.collegeId, 10)
      : request.params.id
        ? parseInt(request.params.id, 10)
        : undefined;

    // Fetch membership if collegeId is available
    let membership: MemberContext | undefined;
    if (collegeId) {
      const memberRecord = await this.memberRepository.findOne({
        where: { userId: user.id, collegeId },
      });

      if (memberRecord) {
        membership = {
          userId: memberRecord.userId,
          collegeId: memberRecord.collegeId,
          role: memberRecord.role as any,
        };
      }
    }

    // Create ability for the user
    const ability = this.caslAbilityFactory.createForUser(user, membership);

    // Check all policies
    const allowed = policyHandlers.every((handler) =>
      ability.can(handler.action, handler.subject)
    );

    if (!allowed) {
      throw new ForbiddenException("Insufficient permissions");
    }

    // Attach ability to request for use in controllers
    request.ability = ability;

    return true;
  }
}
