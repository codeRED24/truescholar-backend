import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "src/cms/auth/dto/auth.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {}
