import { Controller, Get, Query } from "@nestjs/common";
import CmsStreamService from "./stream.service";
import { StreamSearchDto } from "./dto/cmsStream.dto";

@Controller("cms-stream")
export default class CmsStreamController {
  constructor(private readonly cmsStreamService: CmsStreamService) {}

  @Get("all")
  getStreams(@Query() query: StreamSearchDto) {
    const { filter_name, page = 1, limit = 20 } = query;
    return this.cmsStreamService.getStreams(filter_name, page, limit);
  }
}
