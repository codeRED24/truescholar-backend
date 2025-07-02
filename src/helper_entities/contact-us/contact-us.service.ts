import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ContactUs } from "./contact-us.entity";
import { CreateContactUsDto } from "./dto/create-contact-us.dto";
import { UpdateContactUsDto } from "./dto/update-contact-us.dto";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepository: Repository<ContactUs>,
    @InjectRepository(CourseGroup)
    private readonly courseGroupRepository: Repository<CourseGroup>
  ) {}

  findAll(): Promise<ContactUs[]> {
    return this.contactUsRepository.find({
      relations: ["course_group"],
    });
  }

  findOne(id: number): Promise<ContactUs> {
    return this.contactUsRepository.findOne({
      where: { contact_us_id: id },
      relations: ["course_group"],
    });
  }

  create(createContactUsDto: CreateContactUsDto): Promise<ContactUs> {
    const contactUs = this.contactUsRepository.create(createContactUsDto);
    return this.contactUsRepository.save(contactUs);
  }

  async update(
    id: number,
    updateContactUsDto: UpdateContactUsDto
  ): Promise<ContactUs> {
    const contactUs = await this.contactUsRepository.preload({
      contact_us_id: id,
      ...updateContactUsDto,
    });
    if (!contactUs) {
      throw new NotFoundException(`ContactUs with id ${id} not found`);
    }
    return this.contactUsRepository.save(contactUs);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.contactUsRepository.delete(id);
    return result.affected > 0;
  }
}
