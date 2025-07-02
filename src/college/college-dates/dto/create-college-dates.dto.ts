import { QueryDslGeoBoundingBoxQueryKeys } from "@elastic/elasticsearch/lib/api/types";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsNumber,
  Length,
  IsBoolean,
} from "class-validator";

export class CreateCollegeDatesDto {
  @ApiProperty({ description: "ID of the college" })
  @IsNotEmpty()
  @IsNumber()
  college_id: number;

  @ApiProperty({ description: "Start Date", type: Date })
  @IsDateString() 
  start_date: Date;

  @ApiProperty({ description: "End date of the event", type: Date })
  @IsDateString() 
  end_date: Date;

  @ApiProperty({description: "Is_Confirmed" , type: Boolean})
  @IsBoolean()
  is_confirmed: boolean

  @ApiProperty({ description: "Event description" })
  @IsOptional()
  @IsString()
  event?: string;

  @ApiProperty({ description: "Additional description", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;
}
