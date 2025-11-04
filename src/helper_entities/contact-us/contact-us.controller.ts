import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { sendEmail } from '../../utils/email';

@ApiTags('contact-us')
@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Get()
  findAll() {
    return this.contactUsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const contactUs = await this.contactUsService.findOne(id);
    if (!contactUs) {
      throw new NotFoundException(`ContactUs with id ${id} not found`);
    }
    return contactUs;
  }

  @Post()
  async create(@Body() createContactUsDto: CreateContactUsDto) {
    const contactUs = await this.contactUsService.create(createContactUsDto);
    if (process.env.TO_EMAIL) {
      sendEmail('New Contact Us Submission', 'new-enquiry', {
        name: contactUs.name,
        email: contactUs.email,
        phone: contactUs.mobile_no,
        message: contactUs.query,
      });
    }
    return contactUs;
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateContactUsDto: UpdateContactUsDto,
  ) {
    const updatedContactUs = await this.contactUsService.update(
      id,
      updateContactUsDto,
    );
    if (!updatedContactUs) {
      throw new NotFoundException(`ContactUs with id ${id} not found`);
    }
    return updatedContactUs;
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const deleted = await this.contactUsService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`ContactUs with id ${id} not found`);
    }
    return { message: 'ContactUs deleted successfully' };
  }
}
