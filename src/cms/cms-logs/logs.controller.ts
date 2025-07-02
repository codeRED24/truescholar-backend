import { Controller, Get, Param, Query } from "@nestjs/common";
import { LogsService } from "./logs.service";
import { LogType } from "../../common/enums";

@Controller("cms-logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get("/:type/:reference_id")
  getLogs(
    @Param("type") type: LogType,
    @Param("reference_id") reference_id: number,
    @Query("page") page: number,
    @Query("limit") limit: number,
    @Query("user_id") user_id?: number
  ) {
    return this.logsService.getLogs(type, reference_id, page, limit, user_id);
  }

  @Get("/:type")
  getLogByTypes(
    @Param("type") type: LogType,
    @Query("reference_id") reference_id?: number,
    @Query("name") name?: string,
    @Query("requestType") requestType?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.logsService.getLogByType(
      type,
      reference_id,
      name,
      requestType,
      page,
      limit
    );
  }
}
