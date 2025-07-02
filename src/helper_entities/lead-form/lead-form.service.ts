import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateLeadFormDto } from "./dto/create-lead-form.dto";
import { UpdateLeadFormDto } from "./dto/update-lead-form.dto";
import { LeadForm } from "./lead-form.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { City } from "../../helper_entities/cities/city.entity";

@Injectable()
export class LeadFormService {
  constructor(
    @InjectRepository(LeadForm)
    private readonly leadFormRepository: Repository<LeadForm>,
    @InjectRepository(CourseGroup)
    private readonly courseGroupRepository: Repository<CourseGroup>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>
  ) {}

  // GET all lead forms
  async findAll(): Promise<LeadForm[]> {
    return this.leadFormRepository.find();
  }

  // GET one lead form by id
  async findOne(id: number): Promise<LeadForm> {
    const leadForm = await this.leadFormRepository.findOne({
      where: { lead_form_id: id },
    });
    if (!leadForm) {
      throw new NotFoundException(`Lead form with ID ${id} not found`);
    }
    return leadForm;
  }

  // Create new lead form
  async create(createLeadFormDto: CreateLeadFormDto): Promise<LeadForm> {
    const courseGroup = await this.courseGroupRepository.findOne({
      where: { course_group_id: createLeadFormDto.course_group_id },
    });
    if (!courseGroup) {
      throw new NotFoundException(
        `Course Group with ID ${createLeadFormDto.course_group_id} not found`
      );
    }

    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createLeadFormDto.college_id },
    });
    if (!college) {
      throw new NotFoundException(
        `College with ID ${createLeadFormDto.college_id} not found`
      );
    }

    const city = await this.cityRepository.findOne({
      where: { city_id: createLeadFormDto.city_id },
    });
    if (!city) {
      throw new NotFoundException(
        `City with ID ${createLeadFormDto.city_id} not found`
      );
    }

    const leadForm = this.leadFormRepository.create({
      ...createLeadFormDto,
      course_group: courseGroup,
      college,
      city,
    });

    return this.leadFormRepository.save(leadForm);
  }

  // Update a lead form by ID
  async update(
    id: number,
    updateLeadFormDto: UpdateLeadFormDto
  ): Promise<LeadForm> {
    const leadForm = await this.findOne(id);
    Object.assign(leadForm, updateLeadFormDto);
    return this.leadFormRepository.save(leadForm);
  }

  // Delete a lead form by ID
  async delete(id: number): Promise<void> {
    const result = await this.leadFormRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lead form with ID ${id} not found`);
    }
  }
}
