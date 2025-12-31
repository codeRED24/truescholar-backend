import {
  Controller,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nest-lab/fastify-multer";
import { BulkImportService } from "./bulk-import.service";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { PoliciesGuard, CheckPolicies } from "../casl";
import { CollegeRole } from "../common/enums";

@ApiTags("College Onboarding")
@Controller("colleges/:collegeId/onboarding")
@UseGuards(AuthGuard, PoliciesGuard)
@ApiBearerAuth()
export class BulkImportController {
  constructor(private readonly bulkImportService: BulkImportService) {}

  @Post("import")
  @CheckPolicies({ action: "manage", subject: "Member" })
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "CSV or XLS file",
        },
        defaultRole: {
          type: "string",
          enum: ["student", "alumni"],
          default: "student",
        },
      },
    },
  })
  @ApiOperation({ summary: "Bulk import students/alumni from CSV/XLS" })
  @ApiResponse({ status: 200, description: "Import result" })
  @ApiResponse({ status: 400, description: "Invalid file or format" })
  async bulkImport(
    @Param("collegeId", ParseIntPipe) collegeId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      })
    )
    file: Express.Multer.File,
    @Body("defaultRole") defaultRole: string,
    @Req() req: any
  ) {
    const role =
      defaultRole === "alumni" ? CollegeRole.ALUMNI : CollegeRole.STUDENT;
    return this.bulkImportService.processBulkImport(
      collegeId,
      req.user.id,
      file,
      role
    );
  }
}
