import { PartialType } from "@nestjs/mapped-types";
import { RegisterUserDto } from "../../auth/dto/register-users.dto";

export class UpdateUserDto extends PartialType(RegisterUserDto) {}
