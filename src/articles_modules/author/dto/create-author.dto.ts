import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  isPort,
} from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ description: 'The name of the author' })
  @IsNotEmpty()
  author_name: string;

  @ApiProperty({ description: 'View name of the author' })
  @IsOptional()
  @IsString()
  view_name?: string;

  @ApiProperty({ description: 'Email of the author' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: "Role of the user"})
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({
    description: 'Indicates if the author is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @ApiProperty({ description: 'About the author', required: false })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiProperty({ description: 'Image URL of the author', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'Article ID associated with the author',
    required: false,
  })
  @IsOptional()
  // @IsUUID()
  article_id?: number;
}
