import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import { CreateUserDto, UpdateUserDto } from "./dto/auth.dto";
import * as jwt from "jsonwebtoken";
import { LogsService } from "../cms-logs/logs.service";
import { LogType, RequestType } from "../../common/enums";
import { tryCatchWrapper } from "../../config/application.errorHandeler";

@Injectable()
export default class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logService: LogsService
  ) {}

  async createUser(user: CreateUserDto, userId: number) {
    return tryCatchWrapper(async () => {
      const {
        email,
        name,
        password,
        role,
        view_name,
        about,
        image,
        is_active,
      } = user;

      // Check if a user already exists with the provided email
      const existingUser = await this.dataSource.query(
        "SELECT id FROM cms_users WHERE email = $1",
        [email]
      );

      if (existingUser.length > 0) {
        // If the user exists, throw a BadRequestException
        throw new BadRequestException("User with this email already exists.");
      }

      // Hash the user's password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user into the database
      await this.dataSource.query(
        `INSERT INTO cms_users (name, email, password, role, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [name, email, hashedPassword, role]
      );

      const removePassword = { ...user, password: undefined };

      if (role === "author") {
        // Insert the user in author table
        await this.dataSource.query(
          `INSERT INTO author (
              created_at, updated_at, author_name, email, view_name, is_active, about, image, role
            ) VALUES (
              NOW(), NOW(), $1, $2, $3, $4, $5, $6, $7
            )`,
          [
            name,
            email,
            view_name ?? "",
            is_active ?? false,
            about ?? "",
            image ?? "",
            role ?? null, // Ensures null is stored instead of undefined
          ]
        );
      }

      await this.logService.createLog(
        userId,
        LogType.USER,
        `User with email ${email} was created by user with ID ${userId}`,
        1,
        RequestType.POST,
        userId,
        removePassword
      );

      // Return a success message
      return {
        success: true,
        message: "Congratulations! User created successfully 🎉",
      };
    });
  }

  async login(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    data: { [key: string]: any };
  }> {
    // Find the user by their email address using a raw SQL query
    const user = await this.dataSource.query(
      "SELECT id, password, role, name FROM cms_users WHERE email = $1",
      [email]
    );

    if (user.length === 0) {
      // If the user does not exist, throw an UnauthorizedException
      throw new UnauthorizedException("Invalid email or password.");
    }

    const { id: userId, password: hashedPassword, role, name } = user[0];

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordValid) {
      // If the passwords don't match, throw an UnauthorizedException
      throw new UnauthorizedException("Invalid email or password.");
    }

    // Generate a JWT token using the user's id as payload
    const payload = { userId, role };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Return a success message and the generated token

    return {
      success: true,
      message: "Congratulations! You have successfully logged in 🎉",
      data: {
        accessToken,
        refreshToken,
        role,
        name,
      },
    };
  }

  // Refresh Token Handler to validate refresh token and generate a new access token
  refreshTokenHandler(refreshToken: string) {
    try {
      // Step 1: Verify the refresh token using the secret key
      const tokenDetails = this.verifyToken(
        refreshToken,
        process.env.JWT_CMS_REFRESH_TOKEN_SECRET // Secret key for verifying refresh token
      );

      // Step 2: Destructure the userId and role from the token details
      const { userId, role } = tokenDetails;

      // Step 3: Check if userId or role is missing in token payload, throw error if invalid
      if (!userId || !role) {
        throw new Error("Invalid token: Missing userId or role.");
      }

      // Step 4: Generate a new access token using the userId and role
      const accessToken = this.generateAccessToken({ userId, role });

      // Step 5: Return success message and the newly generated access token
      return {
        success: true,
        message: "Successfully fetched access token.",
        accessToken,
      };
    } catch (error) {
      // Step 6: Handle errors and throw an UnauthorizedException with a custom error message
      throw new UnauthorizedException("Invalid refresh token.");
    }
  }

  // Generate Access Token
  generateAccessToken(payload: object): string {
    return jwt.sign(payload, process.env.JWT_CMS_ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
  }

  // Generate Refresh Token
  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, process.env.JWT_CMS_REFRESH_TOKEN_SECRET, {
      expiresIn: "14h",
    });
  }

  // Verify Token
  verifyToken(token: string, secret: string): any {
    return jwt.verify(token, secret);
  }

  deleteUser(userId: number) {
    return tryCatchWrapper(async () => {
      // Execute the raw SQL query to check if the user exists
      const user = await this.dataSource.query(
        `SELECT * FROM cms_users WHERE id = $1`,
        [userId]
      );

      // If the user doesn't exist, throw a NotFoundException
      if (user.length === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Delete the user if they exist
      await this.dataSource.query(`DELETE FROM cms_users WHERE id = $1`, [
        userId,
      ]);

      // Return a success response
      return {
        success: true,
        message: `User with ID ${userId} has been deleted successfully`,
      };
    });
  }

  async updateUser(userId: number, user: UpdateUserDto) {
    if (!user) {
      throw new BadRequestException("No fields provided for update.");
    }

    const { email, name, password, role } = user;

    // Check if the user exists with the provided userId
    const existingUser = await this.dataSource.query(
      "SELECT id FROM cms_users WHERE id = $1",
      [userId]
    );

    if (existingUser.length === 0) {
      // If the user does not exist, throw a BadRequestException
      throw new BadRequestException("User not found.");
    }

    // Prepare the fields to update
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (email) {
      // Check if the email is already taken by another user
      const emailCheck = await this.dataSource.query(
        "SELECT id FROM cms_users WHERE email = $1 AND id != $2",
        [email, userId]
      );

      if (emailCheck.length > 0) {
        throw new BadRequestException("User with this email already exists.");
      }

      fieldsToUpdate.push("email = $" + (fieldsToUpdate.length + 1));
      values.push(email);
    }

    if (name) {
      fieldsToUpdate.push("name = $" + (fieldsToUpdate.length + 1));
      values.push(name);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fieldsToUpdate.push("password = $" + (fieldsToUpdate.length + 1));
      values.push(hashedPassword);
    }

    if (role) {
      fieldsToUpdate.push("role = $" + (fieldsToUpdate.length + 1));
      values.push(role);
    }

    if (fieldsToUpdate.length === 0) {
      throw new BadRequestException("No fields provided for update.");
    }

    // Add the userId as the last parameter for the WHERE clause
    values.push(userId);

    // Construct the update query dynamically
    const query = `
      UPDATE cms_users
      SET ${fieldsToUpdate.join(", ")}, updated_at = NOW()
      WHERE id = $${fieldsToUpdate.length + 1}
    `;

    // Execute the query
    await this.dataSource.query(query, values);

    await this.logService.createLog(
      userId,
      LogType.USER,
      `User with ID ${userId} was updated successfully`,
      1,
      RequestType.PUT,
      userId,
      user
    );

    // Return a success message
    return {
      success: true,
      message: "User updated successfully 🎉",
    };
  }

  getProfileDetail(user_id: number) {
    return tryCatchWrapper(async () => {
      const query =
        "SELECT id, name, email, role, created_at, updated_at from cms_users WHERE id = $1";
      const result = await this.dataSource.query(query, [user_id]);
      return {
        success: true,
        message: "Successfully got user details.",
        data: result[0],
      };
    });
  }

  async findAll(page: number, limit: number, role?: string, name?: string) {
    const currentPage = page || 1;
    const pageSize = limit || 10;
    const offset = (currentPage - 1) * pageSize;

    // Base query and parameters array
    let query = `SELECT * FROM cms_users`;
    let countQuery = `SELECT COUNT(*) AS total FROM cms_users`;
    let conditions: string[] = [];
    let params: any[] = [];

    // Add filters dynamically
    if (role) {
      conditions.push(`role = $${params.length + 1}`);
      params.push(role);
    }

    if (name) {
      conditions.push(`name ILIKE $${params.length + 1}`);
      params.push(`%${name}%`);
    }

    // Append WHERE conditions if any exist
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
      countQuery += ` WHERE ` + conditions.join(" AND ");
    }

    // Add ORDER, LIMIT, and OFFSET
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);

    // Execute queries
    const users = await this.dataSource.query(query, params);
    const totalUsers = await this.dataSource.query(
      countQuery,
      params.slice(0, params.length - 2)
    ); // Exclude LIMIT & OFFSET params

    // Return paginated data with metadata
    return {
      success: true,
      data: users,
      meta: {
        total: parseInt(totalUsers[0].total, 10),
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(totalUsers[0].total / pageSize),
      },
    };
  }
}
