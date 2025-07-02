import { Controller, Get, Query } from "@nestjs/common";
import { LocationSearchDto } from "./dto/LocationSearch.dto";
import CmsLocationService from "./location.service";

@Controller("cms-location")
export default class CmsLocationController {
  constructor(private readonly cmsLocationService: CmsLocationService) {}

  @Get("countries")
  getCountries(@Query() query: LocationSearchDto) {
    const { filter_name, page = 1, limit = 10 } = query;
    return this.cmsLocationService.getCountries(filter_name, page, limit);
  }

  @Get("states")
  getStates(@Query() query: LocationSearchDto) {
    const { filter_name, parent_id, page = 1, limit = 20 } = query;
    return this.cmsLocationService.getStates(
      parent_id,
      filter_name,
      page,
      limit
    );
  }

  @Get("cities")
  getCities(@Query() query: LocationSearchDto) {
    const { filter_name, parent_id, page = 1, limit = 20 } = query;
    return this.cmsLocationService.getCities(
      parent_id,
      filter_name,
      page,
      limit
    );
  }
}
