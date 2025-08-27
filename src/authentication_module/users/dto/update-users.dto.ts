import { PartialType } from "@nestjs/mapped-types";
import { RegisterUserDto } from "./register-users.dto";

export class UpdateUserDto extends PartialType(RegisterUserDto) {}
