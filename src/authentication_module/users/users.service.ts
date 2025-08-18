import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { User } from "./users.entity";
import { CreateUserDto } from "./dto/create-users.dto";
import { UpdateUserDto } from "./dto/update-users.dto";
import * as bcrypt from "bcrypt";
import { classToPlain } from "class-transformer";
import * as dotenv from "dotenv";

dotenv.config();
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD);

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // GET ALL
  async findAll(username?: string): Promise<User[]> {
    if (username) {
      return this.userRepository.find({
        where: {
          username: Like(`%${username}%`),
        },
      });
    }
    return this.userRepository.find();
  }

  // GET /users/:id
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { kapp_uuid1: id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // POST (Sign Up)
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...otherDetails } = createUserDto;

    // Hashing the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      ...otherDetails,
      password: hashedPassword,
    });

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("User ID or Username must be unique");
      }
      throw error;
    }
  }
  // Validate User by Username and Password
  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
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

  // Password change and everything related to the OTP
  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async updateOtp(id: number, otp: string): Promise<void> {
    const user = await this.findOne(id);
    user.otp = otp;
    await this.userRepository.save(user);
  }
}
