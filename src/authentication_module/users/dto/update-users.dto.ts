import { PartialType } from "@nestjs/mapped-types";
import { RegisterUserDto } from "./create-users.dto";

export class UpdateUserDto extends PartialType(RegisterUserDto) {}
