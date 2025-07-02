import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListingContent } from "./listing-content.entity";
import { CreateListingContentDto } from "./dto/create-listing-content.dto";
import { UpdateListingContentDto } from "./dto/update-listing-content.dto";
import { City } from "../cities/city.entity";
import { State } from "../state/state.entity";
import { Stream } from "../stream/stream.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { FilterListingContentDto } from "./dto/create-listing-content.dto";

@Injectable()
export class ListingContentService {
  constructor(
    @InjectRepository(ListingContent)
    private readonly listingContentRepository: Repository<ListingContent>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
    @InjectRepository(CourseGroup)
    private readonly courseGroupRepository: Repository<CourseGroup>
  ) {}

  async create(createDto: CreateListingContentDto) {
    // Fetch the related entities using their IDs
    // const city = await this.cityRepository.findOne({ where: { city_id: createDto.city_id } });
    // const state = await this.stateRepository.findOne({ where: { state_id: createDto.state_id } });
    // const stream = await this.streamRepository.findOne({ where: { stream_id: createDto.stream_id } });
    // const courseGroup = await this.courseGroupRepository.findOne({ where: { course_group_id: createDto.course_group_id } });

    // if (!city || !state || !stream || !courseGroup) {
    //   throw new NotFoundException('One or more related entities not found.');
    // }

    // Create and save the listing content
    const listingContent = this.listingContentRepository.create({
      ...createDto,
      
    });

    return this.listingContentRepository.save(listingContent);
  }

  async findAll() {
    return this.listingContentRepository.find({
      relations: ["city", "state", "stream", "courseGroup"],
    });
  }

  async findOne(id: number) {
    const listingContent = await this.listingContentRepository.findOne({
      where: { listing_content_id: id },
      relations: ["city", "state", "stream", "courseGroup"],
    });

    if (!listingContent) {
      throw new NotFoundException(`ListingContent with ID ${id} not found.`);
    }

    return listingContent;
  }

  async update(id: number, updateDto: UpdateListingContentDto) {
    await this.findOne(id);
    await this.listingContentRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const listingContent = await this.findOne(id);
    return this.listingContentRepository.remove(listingContent);
  }

  async findFiltered(params: FilterListingContentDto) {
    const query = this.listingContentRepository.createQueryBuilder("listingContent");

    if (params.city_id) {
      query.andWhere("listingContent.city_id = :city_id", { city_id: params.city_id });
    }
    if (params.state_id) {
      query.andWhere("listingContent.state_id = :state_id", { state_id: params.state_id });
    }
    if (params.course_group_id) {
      query.andWhere("listingContent.course_group_id = :course_group_id", { course_group_id: params.course_group_id });
    }
    if (params.stream_id) {
      query.andWhere("listingContent.stream_id = :stream_id", { stream_id: params.stream_id });
    }

    query.leftJoinAndSelect("listingContent.city", "city");
    query.leftJoinAndSelect("listingContent.state", "state");
    query.leftJoinAndSelect("listingContent.stream", "stream");
    query.leftJoinAndSelect("listingContent.courseGroup", "courseGroup");

    return query.getMany();
  }
}
