import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  UserProfile,
  ExperienceEntry,
  EducationEntry,
} from "./user-profile.entity";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { UpdateProfileDto } from "./profile.dto";
import { v4 as uuidv4 } from "uuid";
import { IEventBus, EVENT_BUS } from "@/shared/events";
import { DomainEvent } from "@/shared/events/domain-event";

// Domain Events for User
export class UserUpdatedEvent extends DomainEvent {
  readonly eventType = "user.updated";
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly bio?: string
  ) {
    super(userId);
  }
  protected getPayload() {
    return {
      name: this.name,
      bio: this.bio,
    };
  }
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  /**
   * Get or create a user profile by user_id
   */
  async getOrCreateProfile(userId: string): Promise<UserProfile> {
    let profile = await this.profileRepository.findOne({
      where: { user_id: userId },
    });

    if (!profile) {
      profile = this.profileRepository.create({
        user_id: userId,
        experience: [],
        education: [],
        skills: [],
      });
      await this.profileRepository.save(profile);
    }

    return profile;
  }

  /**
   * Get user profile by user_id
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.profileRepository.findOne({
      where: { user_id: userId },
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateDto: UpdateProfileDto
  ): Promise<UserProfile> {
    const profile = await this.getOrCreateProfile(userId);

    // Add UUIDs to new experience entries
    if (updateDto.experience) {
      updateDto.experience = updateDto.experience.map((exp) => ({
        ...exp,
        id: exp.id || uuidv4(),
      }));
    }

    // Add UUIDs to new education entries
    if (updateDto.education) {
      updateDto.education = updateDto.education.map((edu) => ({
        ...edu,
        id: edu.id || uuidv4(),
      }));
    }

    // Merge updates
    Object.assign(profile, updateDto);

    const savedProfile = await this.profileRepository.save(profile);

    // Emit event for search indexing
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      await this.eventBus.publish(
        new UserUpdatedEvent(userId, user.name || "", savedProfile.bio)
      );
    }

    return savedProfile;
  }

  /**
   * Update user's avatar image
   */
  async updateUserImage(userId: string, imageUrl: string): Promise<void> {
    await this.userRepository.update({ id: userId }, { image: imageUrl });
  }

  /**
   * Add experience entry
   */
  async addExperience(
    userId: string,
    experience: Omit<ExperienceEntry, "id">
  ): Promise<UserProfile> {
    const profile = await this.getOrCreateProfile(userId);

    const newEntry: ExperienceEntry = {
      ...experience,
      id: uuidv4(),
    };

    profile.experience = [...(profile.experience || []), newEntry];
    return this.profileRepository.save(profile);
  }

  /**
   * Update experience entry
   */
  async updateExperience(
    userId: string,
    experienceId: string,
    updates: Partial<ExperienceEntry>
  ): Promise<UserProfile> {
    const profile = await this.getOrCreateProfile(userId);

    profile.experience = (profile.experience || []).map((exp) =>
      exp.id === experienceId ? { ...exp, ...updates } : exp
    );

    return this.profileRepository.save(profile);
  }

  /**
   * Delete experience entry
   */
  async deleteExperience(
    userId: string,
    experienceId: string
  ): Promise<UserProfile> {
    const profile = await this.getOrCreateProfile(userId);

    profile.experience = (profile.experience || []).filter(
      (exp) => exp.id !== experienceId
    );

    return this.profileRepository.save(profile);
  }

  /**
   * Add education entry
   */
  async addEducation(
    userId: string,
    education: {
      collegeId?: number | null;
      collegeName?: string | null;
      courseId?: number | null;
      courseName?: string | null;
      fieldOfStudy?: string | null;
      startYear?: number | null;
      endYear?: number | null;
      grade?: string | null;
      description?: string | null;
    }
  ): Promise<UserProfile> {
    const profile = await this.getOrCreateProfile(userId);

    const newEntry: EducationEntry = {
      id: uuidv4(),
      collegeId: education.collegeId ?? null,
      collegeName: education.collegeName ?? null,
      courseId: education.courseId ?? null,
      courseName: education.courseName ?? null,
      fieldOfStudy: education.fieldOfStudy ?? null,
      startYear: education.startYear ?? null,
      endYear: education.endYear ?? null,
      grade: education.grade ?? null,
      description: education.description ?? null,
    };

    profile.education = [...(profile.education || []), newEntry];
    return this.profileRepository.save(profile);
  }

  /**
   * Update education entry
   */
  async updateEducation(
    userId: string,
    educationId: string,
    updates: Partial<EducationEntry>
  ): Promise<UserProfile> {
    const profile = await this.getOrCreateProfile(userId);

    profile.education = (profile.education || []).map((edu) =>
      edu.id === educationId ? { ...edu, ...updates } : edu
    );

    return this.profileRepository.save(profile);
  }

  /**
   * Delete education entry
   */
  async deleteEducation(
    userId: string,
    educationId: string
  ): Promise<UserProfile> {
    const profile = await this.getOrCreateProfile(userId);

    profile.education = (profile.education || []).filter(
      (edu) => edu.id !== educationId
    );

    return this.profileRepository.save(profile);
  }
}
