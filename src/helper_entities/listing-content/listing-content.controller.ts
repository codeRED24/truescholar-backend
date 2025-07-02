import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
  } from "@nestjs/common";
  import { ListingContentService } from "./listing-content.service";
  import { CreateListingContentDto } from "./dto/create-listing-content.dto";
  import { UpdateListingContentDto } from "./dto/update-listing-content.dto";
  import { FilterListingContentDto } from "./dto/create-listing-content.dto";
  import { Query } from "@nestjs/common";

  
  @Controller("listing-content")
  export class ListingContentController {
    constructor(private readonly listingContentService: ListingContentService) {}
  
    @Post()
    create(@Body() createDto: CreateListingContentDto) {
      return this.listingContentService.create(createDto);
    }
  
    @Get()
    findAll() {
      return this.listingContentService.findAll();
    }
  
    @Get(":id")
    findOne(@Param("id") id: number) {
      return this.listingContentService.findOne(id);
    }
  
    @Patch(":id")
    update(@Param("id") id: number, @Body() updateDto: UpdateListingContentDto) {
      return this.listingContentService.update(id, updateDto);
    }
  
    @Delete(":id")
    remove(@Param("id") id: number) {
      return this.listingContentService.remove(id);
    }
    @Get("filter")
    findFiltered(@Query() query: FilterListingContentDto) {
      return this.listingContentService.findFiltered(query);
    }
  }
  