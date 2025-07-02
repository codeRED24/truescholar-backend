import { IsOptional, IsNumber, IsString } from "class-validator";

export class StreamSearchDto {
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
