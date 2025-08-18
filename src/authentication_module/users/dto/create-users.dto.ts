import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsEmail,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The custom ID of the user' })
  @IsOptional()
  custom_id: string;

  @ApiProperty({ description: 'Email of the user', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Username of the user', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'First name of the user' })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({ description: 'Last name of the user', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ description: 'Priority of the user', required: false })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ description: 'Company of the user', required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ description: 'Designation of the user', required: false })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiProperty({ description: 'Date of Birth of the user', required: false })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({ description: 'Tenth Board of the user', required: false })
  @IsOptional()
  @IsString()
  tenth_board?: string;

  @ApiProperty({ description: 'Tenth Percentage of the user', required: false })
  @IsOptional()
  tenth_percentage?: string;

  @ApiProperty({ description: 'Tenth Pass Year of the user', required: false })
  @IsOptional()
  @IsNumber()
  tenth_pass_year?: number;

  @ApiProperty({ description: 'Twelfth Board of the user', required: false })
  @IsOptional()
  @IsString()
  twelth_board?: string;

  @ApiProperty({
    description: 'Twelfth Percentage of the user',
    required: false,
  })
  @IsOptional()
  twelth_percentage?: string;

  @ApiProperty({
    description: 'Twelfth Pass Year of the user',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  twelth_pass_year?: number;

  @ApiProperty({ description: 'Student City of the user', required: false })
  @IsOptional()
  @IsString()
  student_city?: string;

  @ApiProperty({ description: 'Student State of the user', required: false })
  @IsOptional()
  @IsString()
  student_state?: string;

  @ApiProperty({ description: 'Interest in Course', required: false })
  @IsOptional()
  @IsString()
  interest_incourse?: string;

  @ApiProperty({ description: 'Year Intake', required: false })
  @IsOptional()
  @IsNumber()
  year_intake?: number;

  @ApiProperty({ description: 'Institution Name', required: false })
  @IsOptional()
  @IsString()
  insti_name?: string;

  @ApiProperty({ description: 'Institution City', required: false })
  @IsOptional()
  @IsString()
  insti_city?: string;

  @ApiProperty({ description: 'Institution Designation', required: false })
  @IsOptional()
  @IsString()
  insti_designation?: string;

  @ApiProperty({ description: 'Institution Purpose', required: false })
  @IsOptional()
  @IsString()
  insti_purpose?: string;

  @ApiProperty({ description: 'User Team', required: false })
  @IsOptional()
  @IsString()
  user_team?: string;

  @ApiProperty({ description: 'Mobile Number', required: false })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ description: 'User Role', required: false })
  @IsOptional()
  @IsUUID()
  role?: string;

  @ApiProperty({ description: 'Password of the user', required: true })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Indicates if the OTP has been verified',
    required: false,
  })
  @IsOptional()
  otp_verified?: boolean;
}
