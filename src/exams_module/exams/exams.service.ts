import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, QueryFailedError, DataSource } from "typeorm";
import { CreateExamDto } from "./dto/create-exams.dto";
import { UpdateExamDto } from "./dto/update-exams.dto";
import { Exam } from "./exams.entity";
import { ExamDate } from "../exam-dates/exam_dates.entity";
import { ExamContent } from "../exam-content/exam_content.entity";
import { ExamInfoDto, YearWiseExamInfo } from "./dto/exam-info.dto";
import {
  ExamFiltersResponseDto,
  ExamListingResponseDto,
} from "./dto/exam-listing.dto";
import { ExamInformationDto } from "./dto/exam-info.dto";
import { tryCatchWrapper } from "../../config/application.errorHandeler";

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,

    @InjectRepository(ExamContent)
    private readonly examContentRepository: Repository<ExamContent>,

    @InjectRepository(ExamDate)
    private readonly examDateRepository: Repository<ExamDate>,

    private readonly dataSource: DataSource
  ) {}

  // Create Exams
  async create(createExamDto: CreateExamDto): Promise<Exam> {
    const { Stream, exam_center_city, ...examData } = createExamDto;

    // Exams
    const exam = this.examRepository.create(examData);
    try {
      return await this.examRepository.save(exam);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("Custom ID must be unique");
      }
      throw error;
    }
  }

  async findAll(): Promise<Exam[]> {
    const query = `
      SELECT * FROM (
        SELECT 
          e.*, 
          ROW_NUMBER() OVER (PARTITION BY e.exam_id ORDER BY e.kapp_score DESC) AS row_num
        FROM exam AS e 
        LEFT JOIN exam_content AS ec
            ON e.exam_id = ec.exam_id
        WHERE e.is_active = 'true'
        AND (ec.silos IS NOT NULL AND ec.silos <> '')
      ) subquery
      WHERE row_num = 1
      ORDER BY kapp_score DESC;
    `;

    const result = await this.examContentRepository.query(query);
    return result;
  }

  // Get Exam by ID
  async findOne(id: number): Promise<Exam> {
    const exam = await this.examRepository.findOne({
      where: { exam_id: id },
    });
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return exam;
  }

  async update(
    id: number,
    updateExamDto: UpdateExamDto
  ): Promise<{ message: string; data?: Exam }> {
    const exam = await this.findOne(id);
    if (!exam) {
      throw new NotFoundException(`exam with ID ${id} not found`);
    }
    Object.assign(exam, updateExamDto);

    const updateExam = await this.examRepository.save(exam);
    return {
      message: `Exam with ID ${id} updated successfully`,
      data: updateExam,
    };
  }

  // Delete Exam
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.examRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return { message: `Exam with ID ${id} deleted successfully` };
  }

  async getExamInfo(exam_id: number): Promise<ExamInfoDto> {
    const exam = await this.examRepository.findOne({
      where: { exam_id },
    });
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${exam_id} not found`);
    }

    // Map exam details to ExamInformationDto
    const examInformation: ExamInformationDto = {
      exam_id: exam.exam_id,
      exam_name: exam.exam_name,
      exam_description: exam.exam_description,
      slug: exam.slug,
      exam_duration: exam.exam_duration,
      exam_subject: exam.exam_subject,
      mode_of_exam: exam.mode_of_exam,
      level_of_exam: exam.level_of_exam,
      exam_fee_min: exam.exam_fee_min,
      exam_fee_max: exam.exam_fee_max,
      application_start_date: exam.application_start_date?.toString(),
      application_end_date: exam.application_end_date?.toString(),
      exam_date: exam.exam_date?.toString(),
      result_date: exam.result_date?.toString(),
      official_website: exam.official_website,
      official_email: exam.official_email,
      official_mobile: exam.official_mobile,
      eligibilty_criteria: exam.eligibilty_criteria,
      eligibilty_description: exam.eligibilty_description,
      conducting_authority: exam.conducting_authority,
      application_mode: exam.application_mode,
      exam_logo: exam.exam_logo,
      last_update: exam.last_update,
      exan_shortname: exam.exam_shortname,
    };

    const query = `
        SELECT DISTINCT ON (ec.silos) 
            ec.exam_content_id,  
            ec.exam_info, 
            ec.admit_card, 
            ec.silos,
            ec.updated_at, 
            ec.description, 
            ec.meta_desc, 
            ec.author_id, 
            ec.topic_title, 
            a.image AS author_img,  
            a.author_name, 
            a.view_name
        FROM exam_content AS ec
        LEFT JOIN author AS a ON ec.author_id = a.author_id
        WHERE ec.exam_id = $1 AND ec.is_active = true
        ORDER BY ec.silos, ec.updated_at DESC;
    `;

    const latestExamContent = await this.dataSource.query(query, [exam_id]);

    const transformedExamContent = latestExamContent.map((content) => ({
      ...content,
      author: {
        image: content.author_img || null,
        author_name: content.author_name || null,
        view_name: content.view_name || null,
      },
    }));

    // Fetch all exam content with silos as 'news' and group them
    const [newsContent, examDatesByYear] = await Promise.all([
      this.examContentRepository.find({
        where: { exam_id, silos: "news", is_active: true },
        order: { updated_at: "DESC" },
        relations: ["author"],
      }),
      this.examDateRepository.find({
        where: { exam_id },
      }),
    ]);

    const newsSection = newsContent.map((content) => {
      return {
        exam_content_id: content.exam_content_id,
        exam_info: content.exam_info,
        admit_card: content.admit_card,
        silos: content.silos,
        updated_at: content.updated_at,
        description: content.description,
        meta_desc: content.meta_desc,
        author_id: content.author_id,
        author_img: content.author?.image,
        author_name: content.author?.author_name,
        view_name: content.author?.view_name,
        title: content.topic_title,
      };
    });

    // Efficiently group by year
    const aboutExam = this.groupDataByYear(
      transformedExamContent,
      examDatesByYear
    );

    // Return the structured response
    return {
      exam_information: examInformation,
      news_section: newsSection,
      about_exam: aboutExam,
    };
  }

  async getExamInfoById(exam_id: number, silo_name: string) {
    // console.log({ exam_id, silo_name });
    return tryCatchWrapper(async () => {
      const exam = await this.dataSource.query(
        "SELECT exam_id, exam_name, exam_description, exam_logo, conducting_authority, mode_of_exam, exam_duration from exam where exam_id = $1;",
        [exam_id]
      );

      if (!exam && !exam.length) {
        throw new NotFoundException(`Exam with ID ${exam_id} not found`);
      }

      // author details passing in content.
      const [latestContent, distinctSilos] = await Promise.all([
        await this.dataSource.query(
          `
            SELECT ec.*, a.author_name, a.view_name, a.about, a.image, a.email, a.role
            FROM exam_content AS ec                      
            LEFT JOIN author AS a ON ec.author_id = a.author_id 
            WHERE ec.exam_id = $1 
            AND ec.silos = $2 
            AND ec.is_active = true 
            ORDER BY ec.updated_at DESC 
            LIMIT 1;
          `,
          [exam_id, silo_name]
        ),
        this.dataSource.query(
          "SELECT DISTINCT(silos) from exam_content where exam_id = $1 AND is_active = true;",
          [exam_id]
        ),
      ]);

      let examDates;
      let questionPapers;
      if (silo_name === "info") {
        examDates = await this.dataSource.query(
          "SELECT * FROM exam_date WHERE exam_id = $1;",
          [exam_id]
        );
      } else if (silo_name === "question_papers") {
        questionPapers = await this.dataSource.query(
          "SELECT * FROM exam_question_papers WHERE exam_id = $1;",
          [exam_id]
        );
      }

      // checker to validate that exam has question paper or not.
      // const isQuestionPepersExists = await this.dataSource.query(
      //   "SELECT question_paper_id FROM exam_question_papers WHERE exam_id = $1;",
      //   [exam_id]
      // );

      console.log({
        examInformation: exam[0],
        examContent: latestContent.length > 0 ? latestContent[0] : null,
        distinctSilos: [
          ...distinctSilos,
          // ...(isQuestionPepersExists && isQuestionPepersExists.length
          //   ? [{ silos: "question_papers" }]
          //   : []),
        ],
        ...(examDates && { examDates }),
        ...(questionPapers && { questionPapers }),
      });

      return {
        examInformation: exam[0],
        examContent: latestContent.length > 0 ? latestContent[0] : null,
        // distinctSilos: [
        ...distinctSilos,
        //   ...(isQuestionPepersExists && isQuestionPepersExists.length
        //     ? [{ silos: "question_papers" }]
        //     : []),
        // ],
        ...(examDates && { examDates }),
        ...(questionPapers && { questionPapers }),
      };
    });
  }

  private groupDataByYear(
    examContent: ExamContent[],
    examDates: ExamDate[]
  ): YearWiseExamInfo[] {
    const yearWiseData: { [key: string]: YearWiseExamInfo } = {};

    const getYear = (item: ExamContent | ExamDate): string => {
      if ("year" in item) {
        return item.year?.toString() || "";
      } else if ("start_date" in item) {
        const startDate = new Date(item.start_date as string | number | Date);
        return startDate.getFullYear().toString() || "";
      }
      return "";
    };
    [...examContent, ...examDates].forEach((item) => {
      const year = getYear(item);

      if (!yearWiseData[year]) {
        yearWiseData[year] = { year, exam_content: [], exam_dates: [] };
      }

      if ("exam_content_id" in item) {
        yearWiseData[year].exam_content.push({
          exam_content_id: item.exam_content_id,
          exam_info: item.exam_info,
          admit_card: item.admit_card,
          silos: item.silos,
          updated_at: item.updated_at,
          description: item.description,
          meta_desc: item.meta_desc,
          author_id: item.author_id,
          author_img: item.author?.image,
          author_name: item.author?.author_name,
          view_name: item.author?.view_name,
          title: item.topic_title,
        });
      } else if ("exam_date_id" in item) {
        yearWiseData[year].exam_dates.push({
          exam_date_id: item.exam_date_id,
          title: item.title,
          start_date: new Date(item.start_date),
          end_date: new Date(item.end_date),
          updated_at: item.updated_at,
        });
      }
    });

    // Convert the object to an array and filter out empty years
    return Object.values(yearWiseData).filter(
      (data) => data.exam_content.length > 0 || data.exam_dates.length > 0
    );
  }

  async getExamInfoBySlug(slug: string): Promise<ExamInfoDto> {
    const exam = await this.examRepository.findOne({
      where: { slug },
    });
    if (!exam) {
      throw new NotFoundException(`Exam with slug '${slug}' not found`);
    }

    // Map exam details to ExamInformationDto
    const examInformation: ExamInformationDto = {
      exam_id: exam.exam_id,
      exam_name: exam.exam_name,
      exam_description: exam.exam_description,
      slug: exam.slug,
      exam_duration: exam.exam_duration,
      exam_subject: exam.exam_subject,
      mode_of_exam: exam.mode_of_exam,
      level_of_exam: exam.level_of_exam,
      exam_fee_min: exam.exam_fee_min,
      exam_fee_max: exam.exam_fee_max,
      application_start_date: exam.application_start_date?.toString(),
      application_end_date: exam.application_end_date?.toString(),
      exam_date: exam.exam_date?.toString(),
      result_date: exam.result_date?.toString(),
      official_website: exam.official_website,
      official_email: exam.official_email,
      official_mobile: exam.official_mobile,
      eligibilty_criteria: exam.eligibilty_criteria,
      eligibilty_description: exam.eligibilty_description,
      conducting_authority: exam.conducting_authority,
      application_mode: exam.application_mode,
      exam_logo: exam.exam_logo,
      last_update: exam.last_update,
      exan_shortname: exam.exam_shortname,
    };

    // Fetch related content and group them by year
    const [newsContent, examContentByYear, examDatesByYear] = await Promise.all(
      [
        this.examContentRepository.find({
          where: { exam_id: exam.exam_id, silos: "news" },
          order: { updated_at: "DESC" },
          relations: ["author"],
        }),
        this.examContentRepository.find({ where: { exam_id: exam.exam_id } }),
        this.examDateRepository.find({ where: { exam_id: exam.exam_id } }),
      ]
    );

    const newsSection = newsContent.map((content) => ({
      exam_content_id: content.exam_content_id,
      exam_info: content.exam_info,
      admit_card: content.admit_card,
      silos: content.silos,
      updated_at: content.updated_at,
      description: content.description,
      meta_desc: content.meta_desc,
      author_id: content.author_id,
      author_img: content.author?.image,
      author_name: content.author?.author_name,
      view_name: content.author?.view_name,
      title: content.topic_title,
    }));

    const aboutExam = this.groupDataByYear(examContentByYear, examDatesByYear);

    return {
      exam_information: examInformation,
      news_section: newsSection,
      about_exam: aboutExam,
    };
  }

  async findAllExamsListing(
    page: number,
    limit: number,
    // exam_category?: string,
    exam_level?: string,
    exam_streams?: string
  ) {
    try {
      const offset = (page - 1) * limit;

      // SQL filters and query parameters for exams list
      const filters: string[] = [];
      const queryParams: any[] = [limit, offset];

      // if (exam_category) {
      //   filters.push(`e.exam_category = $${queryParams.length + 1}`);
      //   queryParams.push(exam_category);
      // }
      if (exam_level) {
        filters.push(`e.level_of_exam = $${queryParams.length + 1}`);
        queryParams.push(exam_level);
      }
      if (exam_streams) {
        filters.push(`s.stream_name = $${queryParams.length + 1}`);
        queryParams.push(exam_streams);
      }

      const filterQuery = filters.length ? `AND ${filters.join(" AND ")}` : "";

      // Fetch exams with LIMIT and OFFSET
      const exams = await this.dataSource.query(
        `
          SELECT * FROM (
            SELECT DISTINCT ON (e.exam_id)
              e.exam_id,
              e.slug,
              e.exam_name,
              e.exam_logo,
              e.exam_description,
              e.exam_duration,
              e.mode_of_exam,
              e.kapp_score,
              e.is_active,
              e.level_of_exam,
              e.conducting_authority,
              e.exam_fee_min,
              e.exam_fee_max,
              e.exam_shortname,
              e.application_start_date,
              e.application_end_date,
              e.exam_date,
              e.result_date,
              s.stream_name
            FROM exam AS e
            LEFT JOIN stream AS s ON e.stream_id = s.stream_id
            INNER JOIN exam_content AS ec ON e.exam_id = ec.exam_id
            WHERE e.is_active = 'true'
            AND ec.silos IS NOT NULL 
            AND ec.silos <> ''
            ${filterQuery}
            ORDER BY e.exam_id, e.kapp_score DESC
          ) AS subquery
          ORDER BY kapp_score DESC
          LIMIT $1 OFFSET $2;
        `,
        queryParams
      );

      // New parameter list for total count query (excludes LIMIT/OFFSET)
      const totalCountParams: any[] = [];
      const totalFilters: string[] = [];

      // if (exam_category) {
      //   totalFilters.push(`e.exam_category = $${totalCountParams.length + 1}`);
      //   totalCountParams.push(exam_category);
      // }
      if (exam_level) {
        totalFilters.push(`e.level_of_exam = $${totalCountParams.length + 1}`);
        totalCountParams.push(exam_level);
      }
      if (exam_streams) {
        totalFilters.push(`s.stream_name = $${totalCountParams.length + 1}`);
        totalCountParams.push(exam_streams);
      }

      const totalFilterQuery = totalFilters.length
        ? `AND ${totalFilters.join(" AND ")}`
        : "";

      // Fetch total count (without LIMIT & OFFSET)
      const totalCountResult = await this.dataSource.query(
        `
        SELECT COUNT(DISTINCT e.exam_id) AS total
        FROM exam AS e
        LEFT JOIN stream AS s ON e.stream_id = s.stream_id
        LEFT JOIN exam_content AS ec ON e.exam_id = ec.exam_id
        WHERE e.is_active = 'true'
          AND ec.silos IS NOT NULL 
          AND ec.silos <> ''
        ${totalFilterQuery};
        `,
        totalCountParams
      );

      const total = totalCountResult[0]?.total || 0;

      return {
        code: 200,
        status: "success",
        data: {
          exams,
          total,
          limit,
          page,
        },
      };
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching exam listing");
    }
  }

  async findTop3Exams(
    // exam_category?: string,
    // exam_level?: string,
    exam_streams?: string
  ) {
    try {
      // SQL filters and query parameters for exams list
      const filters: string[] = [];
      const queryParams: any[] = [];

      // if (exam_category) {
      //   filters.push(`e.exam_category = $${queryParams.length + 1}`);
      //   queryParams.push(exam_category);
      // }
      // if (exam_level) {
      //   filters.push(`e.level_of_exam = $${queryParams.length + 1}`);
      //   queryParams.push(exam_level);
      // }
      if (exam_streams) {
        filters.push(`s.stream_name = $${queryParams.length + 1}`);
        queryParams.push(exam_streams);
      }

      const filterQuery = filters.length ? `AND ${filters.join(" AND ")}` : "";

      // Fetch top 3 exams sorted by kapp_score, ensuring fallback to exam_name
      const exams = await this.dataSource.query(
        `
        SELECT DISTINCT ON (e.exam_id) 
        COALESCE(e.exam_shortname, e.exam_name) AS exam_short_name
        FROM exam AS e
        LEFT JOIN stream AS s ON e.stream_id = s.stream_id
        INNER JOIN exam_content AS ec ON e.exam_id = ec.exam_id
        WHERE e.is_active = 'true'
        AND ec.silos IS NOT NULL 
        AND ec.silos <> ''
        ${filterQuery}
        ORDER BY e.exam_id, e.kapp_score DESC
        LIMIT 3 OFFSET 0;
        `,
        queryParams
      );

      return {
        code: 200,
        status: true,
        data: exams.map((exam) => ({
          exam_short_name: exam.exam_short_name,
        })),
      };
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching top 3 exams");
    }
  }

  async findAllExamsFilters(
    exam_level?: string,
    exam_streams?: string
  ): Promise<ExamFiltersResponseDto> {
    try {
      const filters: string[] = [];
      const queryParams: any[] = [];

      if (exam_level) {
        filters.push(`e.level_of_exam = $${queryParams.length + 1}`);
        queryParams.push(exam_level);
      }
      if (exam_streams) {
        filters.push(`s.stream_name = $${queryParams.length + 1}`);
        queryParams.push(exam_streams);
      }

      const filterQuery = filters.length ? `AND ${filters.join(" AND ")}` : "";
      const exams = await this.examRepository.query(
        `
          SELECT DISTINCT ON (e.exam_id)
          e.exam_id,
          s.stream_name,
          e.stream_id,
          ec.silos,
          e.level_of_exam
          FROM exam e
          LEFT JOIN stream s ON e.stream_id = s.stream_id
          LEFT JOIN exam_content ec ON e.exam_id = ec.exam_id
          WHERE e.is_active = 'true'
          AND ec.silos IS NOT NULL 
          AND ec.silos <> ''
          ${filterQuery}
      `,
        queryParams
      );

      const filterSection = this.buildFilterSection(exams);

      return {
        code: 200,
        status: "success",
        data: filterSection,
      };
    } catch (error) {
      console.error("Error fetching exam filters:", error);
      return {
        code: 500,
        status: "error",
        message: "Internal Server Error",
      };
    }
  }

  private buildFilterSection(exams): {
    // exam_category: { value: string; count: number }[];
    level_of_exam: { value: string; count: number }[];
    exam_streams: { value: string; count: number }[];
  } {
    const examCategoryMap: { [key: string]: number } = {};
    const levelOfExamMap: { [key: string]: number } = {};
    const streamNameMap: { [key: string]: number } = {};

    // Iterate through each exam to populate the maps
    exams.forEach((exam) => {
      // if (exam.exam_category) {
      //   examCategoryMap[exam.exam_category] =
      //     (examCategoryMap[exam.exam_category] || 0) + 1;
      // }
      if (exam.level_of_exam) {
        levelOfExamMap[exam.level_of_exam] =
          (levelOfExamMap[exam.level_of_exam] || 0) + 1;
      }
      if (exam.stream_name) {
        // Adjusted to use stream relation
        streamNameMap[exam.stream_name] =
          (streamNameMap[exam.stream_name] || 0) + 1;
      }
    });

    // Convert maps to arrays of objects with value and count
    // const exam_category = Object.keys(examCategoryMap)
    //   .map((value) => ({
    //     value,
    //     count: examCategoryMap[value],
    //   }))
    //   .sort((a, b) => b.count - a.count);

    const level_of_exam = Object.keys(levelOfExamMap)
      .map((value) => ({
        value,
        count: levelOfExamMap[value],
      }))
      .sort((a, b) => b.count - a.count);

    const exam_streams = Object.keys(streamNameMap)
      .map((value) => ({
        value,
        count: streamNameMap[value],
      }))
      .sort((a, b) => b.count - a.count);

    // Return the filter_section object
    return {
      // exam_category,
      exam_streams,
      level_of_exam,
    };
  }

  async createBulk(createExamDtos: CreateExamDto[]): Promise<Exam[]> {
    const exams = createExamDtos.map((examDto) =>
      this.examRepository.create(examDto)
    );
    try {
      return await this.examRepository.save(exams);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException(
          "One or more exams have a duplicate key value."
        );
      }
      throw error;
    }
  }

  async findExamsByStream(streamId: number): Promise<any> {
    const exams = await this.examRepository.find({
      where: { stream_id: streamId },
      select: [
        "exam_id",
        "slug",
        "exam_name",
        "exam_logo",
        "level_of_exam",
        "exam_description",
        "exam_duration",
        "mode_of_exam",
        "kapp_score",
        "is_active",
        "conducting_authority",
        "exam_fee_min",
        "exam_fee_max",
        "exam_shortname",
        "application_start_date",
        "application_end_date",
        "exam_date",
        "result_date",
      ],
      relations: ["stream"],
    });

    // Build the filter_section
    const filterSection = this.buildFilterSection(exams);

    // Map the Exam entity to ExamListingDto
    const examListingDtos = exams.map((exam) => ({
      exam_id: exam.exam_id,
      exam_name: exam.exam_name,
      slug: exam.slug,
      exam_logo: exam.exam_logo || "",
      level_of_exam: exam.level_of_exam || "",
      exam_description: exam.exam_description || "",
      exam_duration: exam.exam_duration || 0,
      mode_of_exam: exam.mode_of_exam || "",
      kapp_score: exam.kapp_score || 0,
      is_active: exam.is_active === "true",
      exam_shortname: exam.exam_shortname,
      application_start_date: exam.application_start_date,
      application_end_date: exam.application_end_date,
      exam_date: exam.exam_date,
      result_date: exam.result_date,
      conducting_authority: exam.conducting_authority,
      exam_fee_min: exam.exam_fee_min,
      exam_fee_max: exam.exam_fee_max,
      stream_id: streamId,
      stream_name: exam.stream.stream_name,
    }));

    // Return the exams list and filter_section
    return { exams: examListingDtos, filter_section: filterSection };
  }

  // Helper function to build the filter_section
}
