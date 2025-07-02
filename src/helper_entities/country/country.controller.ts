import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('countries')
@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all countries' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Name of the country',
  })
  @ApiResponse({ status: 200, description: 'List of countries.' })
  findAll(@Query('name') name?: string) {
    return this.countryService.findAll(name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a country by ID' })
  @ApiResponse({ status: 200, description: 'Country details.' })
  @ApiResponse({ status: 404, description: 'Country not found.' })
  findOne(@Param('id') id: number) {
    return this.countryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new country' })
  @ApiResponse({ status: 201, description: 'Country created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  create(@Body(ValidationPipe) createCountryDto: CreateCountryDto) {
    return this.countryService.create(createCountryDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a country' })
  @ApiResponse({ status: 200, description: 'Country updated successfully.' })
  @ApiResponse({ status: 404, description: 'Country not found.' })
  update(
    @Param('id') id: number,
    @Body(ValidationPipe) updateCountryDto: UpdateCountryDto,
  ) {
    return this.countryService.update(id, updateCountryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a country' })
  @ApiResponse({ status: 200, description: 'Country deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Country not found.' })
  delete(@Param('id') id: number) {
    return this.countryService.delete(id);
  }
}
