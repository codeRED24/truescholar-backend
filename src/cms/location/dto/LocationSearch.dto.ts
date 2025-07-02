import { IsOptional, IsNumber, IsString } from "class-validator";

export class LocationSearchDto {
  @IsOptional()
  @IsNumber()
  parent_id?: number; // Optional parent ID (number)

  @IsOptional()
  @IsString()
  filter_name?: string; // Optional filter_name (string)

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
