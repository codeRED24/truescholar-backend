import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { AuthorType } from "../common/enums";

export class FollowUserDto {
  @ApiProperty({ description: "ID of the user to follow" })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ enum: AuthorType })
  @IsOptional()
  @IsEnum(AuthorType)
  authorType?: AuthorType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  followerCollegeId?: number;
}

export class FollowCollegeDto {
  @ApiProperty({ description: "ID of the college to follow" })
  @IsInt()
  collegeId: number;

  @ApiPropertyOptional({ enum: AuthorType })
  @IsOptional()
  @IsEnum(AuthorType)
  authorType?: AuthorType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  followerCollegeId?: number;
}

export class FollowersQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export interface FollowUser {
  id: string;
  name: string;
  image: string | null;
  user_type: string | null;
}

export interface FollowEntry {
  id: string;
  createdAt: Date;
  user: FollowUser;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export interface FollowStatusResponse {
  isFollowing: boolean;
  isFollowedBy: boolean;
}

export interface FollowCollegeEntry {
  id: string;
  createdAt: Date;
  college: {
    college_id: number;
    college_name: string;
    logo_img: string | null;
    slug: string | null;
  };
}
