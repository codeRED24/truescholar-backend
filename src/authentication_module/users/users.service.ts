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

dotenv.config();
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD);

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OtpRequest)

    private readonly otpRepository: Repository<OtpRequest>
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
    updateUserDto: UpdateUserDto
  ): Promise<{ message: string; data?: User }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
}
