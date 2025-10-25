import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { User } from "./users.entity";
import { UpdateUserDto } from "./dto/update-users.dto";
import * as dotenv from "dotenv";
import { OtpRequest } from "./user-otp.entity";
import { RegisterUserDto } from "../auth/dto/register-users.dto";
import { FileUploadService } from "../../utils/file-upload/fileUpload.service";
import { File } from "@nest-lab/fastify-multer";

dotenv.config();
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD);

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OtpRequest)
    private readonly otpRepository: Repository<OtpRequest>,
    private readonly fileUploadService: FileUploadService
  ) {}

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
  async findOne(id: number): Promise<User> {
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
    const user = await this.findOne(id);
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
    const updatedUser = await this.findOne(id);

    return {
      message: `User with ID ${id} updated successfully`,
      data: updatedUser,
    };
  }

  // DELETE /users/:id
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.delete(id);
    return {
      message: `User with ID ${id} deleted successfully`,
    };
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return { ...user };
  }

  async findOneByPhone(contact_number: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { contact_number },
    });
    if (!user) {
      throw new NotFoundException(
        `User with contact_number: ${contact_number} not found`
      );
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
