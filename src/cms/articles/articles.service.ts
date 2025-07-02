import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateArticleCMSDto } from "./dto/create-article.dto";
import { UpdateArticleCMSDto } from "./dto/update-article.dto";
import { DataSource, Repository } from "typeorm";
import { Article } from "../../articles_modules/articles/articles.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { filterArticleDTO } from "./dto/filter-article.dto";
import { tryCatchWrapper } from "../../config/application.errorHandeler";
import { LogsService } from "../cms-logs/logs.service";
import { ArticleTagType, LogType, RequestType } from "../../common/enums";
import { File } from "@nest-lab/fastify-multer";
import { FileUploadService } from "../../utils/file-upload/fileUpload.service";

@Injectable()
export class ArticlesService {
  constructor(
    private readonly dataSource: DataSource,

    private readonly logService: LogsService,

    private readonly fileUploadService: FileUploadService,

    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>
  ) {}

  async create(
    createArticleCMSDto: CreateArticleCMSDto,
    user_id: number,
    og_featured_img: File
  ) {
    return tryCatchWrapper(async () => {
      let og_img = "";


      if (og_featured_img) {
        og_img = await this.fileUploadService.uploadFile(
          og_featured_img,
          "article/featured-image"
        );
      }



      const isActiveValue =
      typeof createArticleCMSDto.is_active === "boolean"
          ? createArticleCMSDto.is_active
          : createArticleCMSDto.is_active === "true" || createArticleCMSDto.is_active === true;
      

      const parseIds = (value: any): number[] => {
        if (!value) return [];
        if (Array.isArray(value))
          return value.map(Number).filter((v) => !isNaN(v));
        if (typeof value === "string")
          return value
            .split(",")
            .map((v) => Number(v.trim()))
            .filter((v) => !isNaN(v));
        return [Number(value)].filter((v) => !isNaN(v));
      };

      const courseIds = parseIds(createArticleCMSDto.course_id);
      const examIds = parseIds(createArticleCMSDto.exam_id);
      const collegeIds = parseIds(createArticleCMSDto.college_id);
      const courseGroupIds = parseIds(createArticleCMSDto.course_group_id);

      // Create the article
      const article = this.articleRepository.create({
        ...createArticleCMSDto,
        og_featured_img: og_img || null, 
        is_active: isActiveValue,
      });


      let result = await this.articleRepository.save(article);

      if (result.slug && !result.slug.includes(`-${result.article_id}`)) {
        result.slug = result.slug.replace("-undefined", "");
        result.slug = `${result.slug}-${result.article_id}`;
        result = await this.articleRepository.save(result);
      }

      const queryRunner =
        this.articleRepository.manager.connection.createQueryRunner();

      const validCourseIds = new Set(
        courseIds.length
          ? (
              await queryRunner.query(
                `SELECT course_id FROM courses WHERE course_id IN (${courseIds.join(",")})`
              )
            ).map((c) => c.course_id)
          : []
      );

      const validExamIds = new Set(
        examIds.length
          ? (
              await queryRunner.query(
                `SELECT exam_id FROM exam WHERE exam_id IN (${examIds.join(",")})`
              )
            ).map((e) => e.exam_id)
          : []
      );

      const validCollegeIds = new Set(
        collegeIds.length
          ? (
              await queryRunner.query(
                `SELECT college_id FROM college_info WHERE college_id IN (${collegeIds.join(",")})`
              )
            ).map((c) => c.college_id)
          : []
      );

      const validCourseGroupIds = new Set(
        courseGroupIds.length
          ? (
              await queryRunner.query(
                `SELECT course_group_id FROM course_group WHERE course_group_id IN (${courseGroupIds.join(",")})`
              )
            ).map((cg) => cg.course_group_id)
          : []
      );

      const mappingsToInsert = [];

      courseIds.forEach((id) => {
        if (validCourseIds.has(id)) {
          mappingsToInsert.push(
            `(${result.article_id}, '${ArticleTagType.COURSES}', ${id})`
          );
        }
      });

      examIds.forEach((id) => {
        if (validExamIds.has(id)) {
          mappingsToInsert.push(
            `(${result.article_id}, '${ArticleTagType.EXAMS}', ${id})`
          );
        }
      });

      collegeIds.forEach((id) => {
        if (validCollegeIds.has(id)) {
          mappingsToInsert.push(
            `(${result.article_id}, '${ArticleTagType.COLLEGE}', ${id})`
          );
        }
      });

      courseGroupIds.forEach((id) => {
        if (validCourseGroupIds.has(id)) {
          mappingsToInsert.push(
            `(${result.article_id}, '${ArticleTagType.COURSE_GROUP}', ${id})`
          );
        }
      });

      // Insert mappings in bulk using raw query
      if (mappingsToInsert.length > 0) {
        await queryRunner.query(`
                INSERT INTO articles_mapping (article_id, tag_type, tag_type_id)
                VALUES ${mappingsToInsert.join(",")}
            `);
      }

      // Log the operation
      await this.logService.createLog(
        user_id,
        LogType.ARTICLE,
        `Article created with ID ${result.article_id}`,
        1,
        RequestType.POST,
        result.article_id,
        { result, ...{ og_featured_img } }
      );

      // Return the final response
      return {
        success: true,
        message: "Successfully created new article",
        article: {
          article_id: result.article_id,
          title: result.title,
          slug: result.slug,
          content: result.content,
          course_id: [...validCourseIds],
          exam_id: [...validExamIds],
          college_id: [...validCollegeIds],
          course_group_id: [...validCourseGroupIds],
        },
      };
    });
  }

  async getAll(filter: filterArticleDTO, page: number = 1, limit: number = 10) {
    const { title, author_name, is_active, status, article_id } = filter;

    let conditions: string[] = [];
    let params: (string | number | boolean)[] = [];

    if (is_active) {
      conditions.push("a.is_active = $" + (params.length + 1));
      params.push(is_active);
    }

    if (article_id) {
      conditions.push("a.article_id = $" + (params.length + 1));
      params.push(article_id);
    }

    if (title) {
      conditions.push(
        "(" +
          "a.title ILIKE $" +
          (params.length + 1) +
          " OR a.sub_title ILIKE $" +
          (params.length + 1) +
          ")"
      );
      params.push(`%${title}%`);
    }

    if (status) {
      conditions.push("a.status = $" + (params.length + 1));
      params.push(status);
    }

    if (author_name) {
      conditions.push("b.author_name ILIKE $" + (params.length + 1));
      params.push(`%${author_name}%`);
    }

    const whereClause =
      conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const query = `
      Select a.article_id, a.title, a.sub_title, a.is_active, a.status, a.author_id, b.author_name
      from article as a Left join author as b
      on a.author_id = b.author_id
      ${whereClause}
      ORDER BY a.updated_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
      `;

    if (page && limit) {
      const offset = (page - 1) * limit;
      params.push(limit, offset);
    }

    const total_article = `
      Select Count(*)  from article;
    `;

    const distinct_authors = `
      SELECT DISTINCT 
      a.author_id, 
      b.author_name
      FROM 
      article AS a
      LEFT JOIN 
      author AS b 
      ON 
      a.author_id = b.author_id 
      Order by author_id ASC;
    `;

    try {
      const result = await this.dataSource.query(query, params);
      const total = await this.dataSource.query(total_article);
      const distinct = await this.dataSource.query(distinct_authors);

      return {
        success: true,
        message: "Articles fetched successfully",
        data: result,
        total: total[0].count,
        authors: distinct,
      };
    } catch (error) {
      throw new Error("Error fetching articles: " + error.message);
    }
  }

  async getOne(article_id: number) {
    return tryCatchWrapper(async () => {
      const query = `
        SELECT 
          a.*, au.author_name, 
          am.tag_type, am.tag_type_id, 
          c.college_id, c.college_name, 
          e.exam_id, e.exam_name, 
          cg.course_group_id, cg.name AS course_group_name, 
          co.course_id, co.course_name
        FROM article a
        LEFT JOIN author au ON a.author_id = au.author_id
        LEFT JOIN articles_mapping am ON a.article_id = am.article_id
        LEFT JOIN college_info c ON am.tag_type = 'college_id' AND am.tag_type_id = c.college_id
        LEFT JOIN exam e ON am.tag_type = 'exam_id' AND am.tag_type_id = e.exam_id
        LEFT JOIN course_group cg ON am.tag_type = 'course_group_id' AND am.tag_type_id = cg.course_group_id
        LEFT JOIN courses co ON am.tag_type = 'course_id' AND am.tag_type_id = co.course_id
        WHERE a.article_id = $1;
      `;
  
      const rows = await this.dataSource.query(query, [article_id]);
  
      if (rows.length === 0) {
        return {
          success: false,
          message: "Article not found",
          data: {},
        };
      }
  
      const firstRow = rows[0]; 
  
      const article = {
        article_id: firstRow.article_id,
        created_at: firstRow.created_at,
        updated_at: firstRow.updated_at,
        title: firstRow.title,
        sub_title: firstRow.sub_title,
        slug: firstRow.slug,
        author_id: firstRow.author_id,
        is_active: firstRow.is_active,
        tags: firstRow.tags,
        publication_date: firstRow.publication_date,
        read_time: firstRow.read_time,
        meta_desc: firstRow.meta_desc,
        img1_url: firstRow.img1_url,
        img2_url: firstRow.img2_url,
        content: firstRow.content,
        status: firstRow.status,
        assigned_to: firstRow.assigned_to,
        approved_by: firstRow.approved_by,
        stage_id: firstRow.stage_id,
        type: firstRow.type,
        og_title: firstRow.og_title,
        og_description: firstRow.og_description,
        og_featured_img: firstRow.og_featured_img,
        author_name: firstRow.author_name,
        college_name: [],
        exam_name: [],
        course_groups_name: [],
        course_name: [],
      };
  
      const addedIds = {
        colleges: new Set(),
        exams: new Set(),
        course_groups: new Set(),
        courses: new Set(),
      };
  
      rows.forEach(row => {
        if (row.college_id && !addedIds.colleges.has(row.college_id)) {
          article.college_name.push({
            value: row.college_id,
            label: row.college_name,
          });
          addedIds.colleges.add(row.college_id);
        }
        if (row.exam_id && !addedIds.exams.has(row.exam_id)) {
          article.exam_name.push({
            value: row.exam_id,
            label: row.exam_name,
          });
          addedIds.exams.add(row.exam_id);
        }
        if (row.course_group_id && !addedIds.course_groups.has(row.course_group_id)) {
          article.course_groups_name.push({
            value: row.course_group_id,
            label: row.course_group_name,
          });
          addedIds.course_groups.add(row.course_group_id);
        }
        if (row.course_id && !addedIds.courses.has(row.course_id)) {
          article.course_name.push({
            value: row.course_id,
            label: row.course_name,
          });
          addedIds.courses.add(row.course_id);
        }
      });
  
      return {
        success: true,
        message: "Article fetched successfully",
        data: article,
      };
    });
  }
  

  async update(
    article_id: number,
    updateArticleCMSDto: UpdateArticleCMSDto,
    userId: number,
    og_featured_img: File
) {
    return tryCatchWrapper(async () => {
        const existingArticle = await this.dataSource.query(
            `SELECT * FROM article WHERE article_id = $1`,
            [article_id]
        );

        if (!existingArticle.length) {
            throw new BadRequestException(`Invalid ${article_id} ID, Article not found.`);
        }

        let og_image = existingArticle[0].og_featured_img;
        if (og_featured_img) {
            og_image = await this.fileUploadService.uploadFile(
                og_featured_img,
                `article/featured-image/${article_id}-${new Date().toISOString()}`
            );
        }

        const { course_id, exam_id, college_id, course_group_id, ...articleFields } = updateArticleCMSDto;

        const fieldsToUpdate = { 
            ...articleFields,  
            og_featured_img: og_image, 
            updated_at: new Date()
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach((key) => {
            if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key];
        });

        await this.dataSource.query(
            `UPDATE article SET ${Object.keys(fieldsToUpdate)
                .map((key, index) => `${key} = $${index + 1}`)
                .join(", ")
            } WHERE article_id = $${Object.values(fieldsToUpdate).length + 1}`,
            [...Object.values(fieldsToUpdate), article_id]
        );

        // **DELETE all previous mappings**
        await this.dataSource.query(
            `DELETE FROM articles_mapping WHERE article_id = $1`,
            [article_id]
        );

        const parseIds = (value: any) => {
          if (!value) return [];  
          if (typeof value === "string") {
            return value.split(",").map((number) => +number);
          }
          return [];
      };
      
        const tagUpdates = {
            [ArticleTagType.COURSES]: parseIds(updateArticleCMSDto.course_id),
            [ArticleTagType.EXAMS]: parseIds(updateArticleCMSDto.exam_id),
            [ArticleTagType.COLLEGE]: parseIds(updateArticleCMSDto.college_id),
            [ArticleTagType.COURSE_GROUP]: parseIds(updateArticleCMSDto.course_group_id),
        };
        console.log("Heman", tagUpdates)

        const mappingsToInsert = [];
        Object.entries(tagUpdates).forEach(([tagType, ids]) => {
            ids.forEach((id) => {
                mappingsToInsert.push({ article_id, tag_type: tagType, tag_type_id: id });
            });
        });

        // **INSERT new mappings**
        if (mappingsToInsert.length) {
            const valuesString = mappingsToInsert.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(", ");
            const flattenedValues = mappingsToInsert.flatMap((m) => [m.article_id, m.tag_type, m.tag_type_id]);
            await this.dataSource.query(
                `INSERT INTO articles_mapping (article_id, tag_type, tag_type_id) VALUES ${valuesString}`,
                flattenedValues
            );
        }

        await this.logService.createLog(
            userId,
            LogType.ARTICLE,
            `Article updated successfully by user with ID ${userId}`,
            1,
            RequestType.PUT,
            article_id,
            fieldsToUpdate
        );

        return {
            success: true,
            message: "Article updated successfully",
            updatedFields: fieldsToUpdate,
        };
    });
}


  

  async remove(article_id: number, userId: number) {
    return tryCatchWrapper(async () => {
      const existingArticle = await this.dataSource.query(
        "SELECT * FROM article WHERE article_id = $1",
        [article_id]
      );

      if (existingArticle.length === 0) {
        throw new Error(`Article with ID ${article_id} not found`);
      }

      const query = `
        DELETE FROM article
        WHERE article_id = $1;
      `;

      const result = await this.dataSource.query(query, [article_id]);

      await this.logService.createLog(
        userId,
        LogType.ARTICLE,
        `Article with ID ${article_id} deleted successfully`,
        1,
        RequestType.DELETE,
        article_id,
        existingArticle[0]
      );

      return {
        message: `Article with ID ${article_id} deleted successfully`,
        data: result,
      };
    });
  }

  async searchArticle(article_name: string, page?: number, limit?: number) {
    return tryCatchWrapper(async () => {
      const params: any[] = [];
      if (article_name) params.push(`%${article_name}%`);
      let paginationClause = "";

      // Add LIMIT and OFFSET only if page and limit are provided
      if (page && limit) {
        const offset = (page - 1) * limit;
        params.push(limit, offset);
        paginationClause = `LIMIT $${params.length - 1} OFFSET $${params.length}`;
      }

      // Main query
      const query = `
        SELECT title
        FROM article
        ${article_name ? "WHERE title ILIKE $1" : ""}
        ${paginationClause};
      `;

      const result = await this.dataSource.query(query, params);

      return {
        success: true,
        message: "Data fetched successfully",
        data: result,
      };
    });
  }
}