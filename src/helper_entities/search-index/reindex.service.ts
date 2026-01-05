import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SearchService } from "./search.service";
import { SearchEntityType } from "@/common/enums";
import { Post } from "@/posts/post.entity";
import { Event } from "@/events/event.entity";
import { User } from "@/authentication_module/better-auth/entities/users.entity";
import { UserProfile } from "@/profile/user-profile.entity";
import { CollegeInfo } from "@/college/college-info/college-info.entity";

@Injectable()
export class ReindexService {
  private readonly logger = new Logger(ReindexService.name);

  constructor(
    private readonly searchService: SearchService,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
    @InjectRepository(CollegeInfo)
    private readonly collegeRepository: Repository<CollegeInfo>
  ) {}

  /**
   * Reindex all posts
   */
  async reindexPosts(): Promise<{ indexed: number; failed: number }> {
    const posts = await this.postRepository.find({
      where: { isDeleted: false },
      select: ["id", "content"],
    });

    const entities = posts.map((p) => ({
      id: p.id,
      text: p.content,
    }));

    return this.searchService.reindexEntities(SearchEntityType.POST, entities);
  }

  /**
   * Reindex all events
   */
  async reindexEvents(): Promise<{ indexed: number; failed: number }> {
    const events = await this.eventRepository.find({
      where: { isDeleted: false },
      select: ["id", "title", "description", "location"],
    });

    const entities = events.map((e) => ({
      id: e.id,
      text: `${e.title} ${e.description || ""} ${e.location || ""}`.trim(),
    }));

    return this.searchService.reindexEntities(SearchEntityType.EVENT, entities);
  }

  /**
   * Reindex all users
   */
  async reindexUsers(): Promise<{ indexed: number; failed: number }> {
    const users = await this.userRepository.find({
      select: ["id", "name"],
    });

    const profiles = await this.profileRepository.find({
      select: ["user_id", "bio"],
    });

    const profileMap = new Map(profiles.map((p) => [p.user_id, p.bio]));

    const entities = users.map((u) => ({
      id: u.id,
      text: `${u.name || ""} ${profileMap.get(u.id) || ""}`.trim(),
    }));

    return this.searchService.reindexEntities(SearchEntityType.USER, entities);
  }

  /**
   * Reindex all colleges
   */
  async reindexColleges(): Promise<{ indexed: number; failed: number }> {
    const colleges = await this.collegeRepository.find({
      select: ["college_id", "college_name", "city"],
    });

    const entities = colleges.map((c) => ({
      id: String(c.college_id),
      text: `${c.college_name} ${c.city || ""}`.trim(),
    }));

    return this.searchService.reindexEntities(
      SearchEntityType.COLLEGE,
      entities
    );
  }

  /**
   * Reindex everything
   */
  async reindexAll(): Promise<{
    posts: { indexed: number; failed: number };
    events: { indexed: number; failed: number };
    users: { indexed: number; failed: number };
    colleges: { indexed: number; failed: number };
  }> {
    this.logger.log("Starting full reindex...");

    const [posts, events, users, colleges] = await Promise.all([
      this.reindexPosts(),
      this.reindexEvents(),
      this.reindexUsers(),
      this.reindexColleges(),
    ]);

    this.logger.log("Full reindex complete");

    return { posts, events, users, colleges };
  }
}
