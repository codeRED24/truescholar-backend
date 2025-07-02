import { IsBoolean, IsString } from "class-validator";

export class UpdateTemplatizationDto {
  @IsBoolean()
  is_active?: boolean;

  @IsString()
  description: string;
}
