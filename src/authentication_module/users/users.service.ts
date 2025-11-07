import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { User } from "./users.entity";
import * as dotenv from "dotenv";
import { FileUploadService } from "../../utils/file-upload/fileUpload.service";
import { File } from "@nest-lab/fastify-multer";
import { RegisterUserDto } from "./dto/create-users.dto";
import { UpdateUserDto } from "./dto/update-users.dto";

dotenv.config();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly fileUploadService: FileUploadService
  ) {}

  async createUser(createUserDto: RegisterUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const user = this.userRepository.create({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
    });

    return this.userRepository.save(user);
  }

  // GET ALL
  // async findAll(username?: string): Promise<User[]> {
  //   if (username) {
  //     return this.userRepository.find({
  //       where: {
  //         name: Like(`%${username}%`),
  //       },
  //     });
  //   }
  //   return this.userRepository.find();
  // }

  // GET /users/:id
  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // PATCH /users/:id
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    file?: File
  ): Promise<{ message: string; data?: User }> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Handle profile picture upload if file is provided
    if (file) {
      const uploadedUrl = await this.fileUploadService.uploadFile(
        file,
        "profile-pictures",
        id
      );
      updateUserDto.user_img_url = uploadedUrl;
    }

    await this.userRepository.update(id, updateUserDto);
    const updatedUser = await this.findUserById(id);

    return {
      message: `User updated successfully`,
      data: updatedUser,
    };
  }

  // DELETE /users/:id
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    await this.userRepository.delete(id);
    return {
      message: `User deleted successfully`,
    };
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return { ...user };
  }

  // Find a user by their custom code. Returns null if not found (no exception).
  async findByCustomCode(custom_code: string): Promise<User | null> {
    if (!custom_code) return null;
    const user = await this.userRepository.findOne({ where: { custom_code } });
    return user || null;
  }

  async findOneByPhone(contact_number: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { contact_number },
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  //get user details for profile page
  async getProfile(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        "id",
        "custom_code",
        "name",
        "email",
        "gender",
        "contact_number",
        "country_of_origin",
        "college_roll_number",
        "dob",
        "user_type",
        "user_img_url",
        "college",
        "custom_code",
        "referrer_id",
      ],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
