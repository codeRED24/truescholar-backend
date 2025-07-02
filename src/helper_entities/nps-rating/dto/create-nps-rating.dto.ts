import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateNpsRatingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  custom_id: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  rating: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mobile_no: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  feedback_query: string;

  @ApiProperty()
  @IsString()
  response_url: string;

  @ApiProperty()
  @IsString()
  location: string;
}
