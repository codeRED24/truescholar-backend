import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Invitation } from "../authentication_module/better-auth/entities/invitation.entity";
import { CollegeInfo } from "../college/college-info/college-info.entity";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { CollegeRole } from "../common/enums";
import { ImportResultDto } from "./dto";
import * as XLSX from "xlsx";
import { Inject } from "@nestjs/common";
import { IEventBus, EVENT_BUS } from "../shared/events";
import { EmailSendEvent } from "../notifications/events/email-send.event";

interface ImportRow {
  email: string;
  phone?: string;
  name?: string;
  role?: string;
  enrollment_year?: number;
}

const INVITE_EXPIRY_DAYS = 10;

@Injectable()
export class BulkImportService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(CollegeInfo)
    private collegeRepository: Repository<CollegeInfo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  /**
   * Process bulk import file (CSV/XLS)
   */
  async processBulkImport(
    collegeId: number,
    inviterId: string,
    file: Express.Multer.File,
    defaultRole: CollegeRole = CollegeRole.STUDENT
  ): Promise<ImportResultDto> {
    // Validate college exists
    const college = await this.collegeRepository.findOne({
      where: { college_id: collegeId },
    });
    if (!college) {
      throw new NotFoundException("College not found");
    }

    // Parse file
    const rows = this.parseFile(file);
    if (rows.length === 0) {
      throw new BadRequestException("File is empty or invalid format");
    }

    if (rows.length > 500) {
      throw new BadRequestException("Maximum 500 rows per import");
    }

    const result: ImportResultDto = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    };

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 for header row and 1-based index

      try {
        await this.processRow(row, collegeId, inviterId, defaultRole, college);
        result.imported++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNum,
          error: error.message || "Unknown error",
        });
      }
    }

    result.success = result.failed === 0;
    return result;
  }

  /**
   * Parse CSV/XLS file to rows
   */
  private parseFile(file: Express.Multer.File): ImportRow[] {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<ImportRow>(sheet);
    return data;
  }

  /**
   * Process a single import row
   */
  private async processRow(
    row: ImportRow,
    collegeId: number,
    inviterId: string,
    defaultRole: CollegeRole,
    college: CollegeInfo
  ): Promise<void> {
    // Validate email
    if (!row.email || !this.isValidEmail(row.email)) {
      throw new Error("Invalid email format");
    }

    const email = row.email.toLowerCase().trim();

    // Check if invitation already exists
    const existingInvite = await this.invitationRepository.findOne({
      where: { email, collegeId, status: "pending" },
    });
    if (existingInvite) {
      throw new Error("Invitation already sent");
    }

    // Generate unique invite token
    const inviteToken = crypto.randomUUID();
    const role = (row.role as CollegeRole) || defaultRole;

    // Create invitation
    const invitation = this.invitationRepository.create({
      id: crypto.randomUUID(),
      collegeId,
      email,
      phoneNumber: row.phone?.toString() || null,
      role,
      status: "pending",
      expiresAt: new Date(
        Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      ),
      inviterId,
      inviteToken,
      source: "bulk_import",
    });

    await this.invitationRepository.save(invitation);

    // Publish email send event
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const inviteUrl = `${frontendUrl}/invite/${inviteToken}`;

    await this.eventBus.publish(
      new EmailSendEvent(
        email,
        `You're invited to join ${college.college_name} on TrueScholar`,
        "college-invite",
        {
          collegeName: college.college_name,
          inviteUrl,
          role,
          name: row.name || "there",
        }
      )
    );

    // TODO: WhatsApp integration
    // if (row.phone) {
    //   await sendWhatsAppInvite(row.phone, inviteUrl, college.college_name);
    // }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
