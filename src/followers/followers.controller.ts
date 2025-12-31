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
import { FollowersService } from "./followers.service";
import {
  FollowUserDto,
  FollowersQueryDto,
  FollowCollegeDto,
} from "./follow.dto";

@ApiTags("Followers")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("followers")
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Post("follow")
  @ApiOperation({ summary: "Follow a user" })
  async follow(@User() user: { id: string }, @Body() dto: FollowUserDto) {
    const follow = await this.followersService.follow(user.id, dto.userId);
    return {
      id: follow.id,
      followingId: follow.followingId,
      createdAt: follow.createdAt,
    };
  }

  @Delete("unfollow/:userId")
  @ApiOperation({ summary: "Unfollow a user" })
  async unfollow(
    @User() user: { id: string },
    @Param("userId") userId: string
  ) {
    await this.followersService.unfollow(user.id, userId);
    return { success: true };
  }

  @Post("follow/college")
  @ApiOperation({ summary: "Follow a college" })
  async followCollege(
    @User() user: { id: string },
    @Body() dto: FollowCollegeDto
  ) {
    const follow = await this.followersService.followCollege(
      user.id,
      dto.collegeId
    );
    return {
      id: follow.id,
      collegeId: follow.collegeId,
      createdAt: follow.createdAt,
    };
  }

  @Delete("unfollow/college/:collegeId")
  @ApiOperation({ summary: "Unfollow a college" })
  async unfollowCollege(
    @User() user: { id: string },
    @Param("collegeId") collegeId: number
  ) {
    await this.followersService.unfollowCollege(user.id, collegeId);
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: "Get current user's followers" })
  async getFollowers(
    @User() user: { id: string },
    @Query() query: FollowersQueryDto
  ) {
    return this.followersService.getFollowers(
      user.id,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
  }

  @Get("following")
  @ApiOperation({ summary: "Get users that current user follows" })
  async getFollowing(
    @User() user: { id: string },
    @Query() query: FollowersQueryDto
  ) {
    return this.followersService.getFollowing(
      user.id,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
  }

  @Get("following/colleges")
  @ApiOperation({ summary: "Get colleges that current user follows" })
  async getFollowingColleges(
    @User() user: { id: string },
    @Query() query: FollowersQueryDto
  ) {
    return this.followersService.getFollowingColleges(
      user.id,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
  }

  @Get("stats")
  @ApiOperation({ summary: "Get follower and following counts" })
  async getStats(@User() user: { id: string }) {
    return this.followersService.getStats(user.id);
  }

  @Get("stats/:userId")
  @ApiOperation({ summary: "Get follower and following counts for a user" })
  async getUserStats(@Param("userId") userId: string) {
    return this.followersService.getStats(userId);
  }

  @Get("status/:userId")
  @ApiOperation({ summary: "Get follow relationship status with a user" })
  async getFollowStatus(
    @User() user: { id: string },
    @Param("userId") otherUserId: string
  ) {
    return this.followersService.getFollowStatus(user.id, otherUserId);
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get followers of a specific user" })
  async getUserFollowers(
    @Param("userId") userId: string,
    @Query() query: FollowersQueryDto
  ) {
    return this.followersService.getFollowers(
      userId,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
  }

  @Get("user/:userId/following")
  @ApiOperation({ summary: "Get users that a specific user follows" })
  async getUserFollowing(
    @Param("userId") userId: string,
    @Query() query: FollowersQueryDto
  ) {
    return this.followersService.getFollowing(
      userId,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
  }

  @Get("college/:collegeId")
  @ApiOperation({ summary: "Get followers of a specific college" })
  async getCollegeFollowers(
    @Param("collegeId") collegeId: number,
    @Query() query: FollowersQueryDto
  ) {
    return this.followersService.getCollegeFollowers(
      collegeId,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
  }

  @Get("college/:collegeId/stats")
  @ApiOperation({ summary: "Get follower count for a college" })
  async getCollegeStats(@Param("collegeId") collegeId: number) {
    return this.followersService.getCollegeStats(collegeId);
  }

  @Get("status/college/:collegeId")
  @ApiOperation({ summary: "Get follow relationship status with a college" })
  async getCollegeFollowStatus(
    @User() user: { id: string },
    @Param("collegeId") collegeId: number
  ) {
    return this.followersService.getCollegeFollowStatus(user.id, collegeId);
  }
}
