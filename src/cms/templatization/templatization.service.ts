import { BadRequestException, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { LogsService } from "../cms-logs/logs.service";
import { collegeSilos } from "./dtos/static.fields";
import { tryCatchWrapper } from "../../config/application.errorHandeler";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TemplatizationCollegeContent } from "./entities/templatization_college_content.entity";
import { LogType, RequestType } from "../../common/enums";
import { UpdateTemplatizationDto } from "./dtos/UpdateTemplatization.dto";

@Injectable()
export class CmsTemplatizationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logsService: LogsService,
    @InjectRepository(TemplatizationCollegeContent)
    private readonly templatizationCollegeContentRepository: Repository<TemplatizationCollegeContent>
  ) {}

  createCollegeTemplates(
    college_id: number,
    silos_name: string,
    user_id: number
  ) {
    return tryCatchWrapper(async () => {
      const templatizedList: { [key: string]: any }[] =
        (await this.constructCollegeTemplate([{ college_id }], silos_name)) ||
        [];

      await this.templatizationCollegeContentRepository.insert(templatizedList);

      await this.logsService.createLog(
        user_id,
        LogType.COLLEGE,
        `Templatized ${templatizedList.length} college info article.`,
        2,
        RequestType.POST,
        1,
        templatizedList.map((list) => list.college_id)
      );

      return {
        success: true,
        total: templatizedList.length,
        message: "Successfully inserted articles.",
      };
    });
  }

  createCollegeBulkTemplatization(silos_name: string, user_id: number) {
    return tryCatchWrapper(async () => {
      if (!collegeSilos.includes(silos_name))
        throw new BadRequestException("Invalid Silos Name.");

      // 1. Getting all colleges whose content is not available or inactive.
      const colleges = await this.dataSource.query(
        `
        SELECT DISTINCT cc.college_id
        FROM college_content cc
        LEFT JOIN (
            SELECT college_id FROM college_content WHERE silos = $1 AND is_active = TRUE
            UNION
            SELECT college_id FROM templatization_college_content WHERE silos = $1
        ) excluded ON cc.college_id = excluded.college_id
        WHERE excluded.college_id IS NULL;
        `,
        [silos_name]
      );

      const extraColleges = await this.dataSource.query(
        `SELECT ci.college_id FROM college_info as ci
            LEFT JOIN (
              SELECT college_id FROM college_content WHERE silos = $1 AND is_active = TRUE
              UNION
              SELECT college_id FROM templatization_college_content WHERE silos = $1
              ) excluded ON ci.college_id = excluded.college_id
            WHERE ci.is_active = true AND excluded.college_id IS NULL;`,
        [silos_name]
      );

      if (
        (!colleges || !colleges.length) &&
        (!extraColleges || !extraColleges.length)
      ) {
        throw new BadRequestException("No colleges found for templatization.");
      }

      // Combine the results and ensure uniqueness by using a Set
      const uniqueColleges = Array.from(
        new Set(
          [...colleges, ...extraColleges].map((college) => college.college_id)
        )
      ).map((college_id) => ({
        college_id,
      }));

      // 2. Generating templates in bulk.
      const templatizedList: { [key: string]: any }[] =
        (await this.constructCollegeTemplate(uniqueColleges, silos_name)) || [];

      // 3. Inserting Templates In Bulk.
      await this.templatizationCollegeContentRepository.insert(templatizedList);

      // 4. Logs
      await this.logsService.createLog(
        user_id,
        LogType.COLLEGE,
        `Templatized ${templatizedList.length} colleges info article.`,
        2,
        RequestType.POST,
        1,
        templatizedList.map((list) => list.college_id)
      );

      return {
        success: true,
        total: templatizedList.length,
        message: "Successfully inserted articles.",
      };
    });
  }

  constructCollegeTemplate(
    colleges: { college_id: number }[],
    silos_name: string
  ) {
    return tryCatchWrapper(async () => {
      if (silos_name === "info") {
        const templatizedList = [];
        await Promise.all(
          colleges.map(async (college: { college_id: number }) => {
            const collegeId = college.college_id;

            const collegeInfo = await this.dataSource.query(
              `
               SELECT 
                 ci.college_name, 
                 ci.founded_year, 
                 ci.campus_size, 
                 ci."UGC_approved",
                 ci.nacc_grade,
                 ci.total_student,
                 s.name as state_name, 
                 c.name as city_name,
                 st.stream_name
                FROM college_info as ci
                LEFT JOIN state as s ON ci.state_id = s.state_id
                LEFT JOIN city as c ON ci.city_id = c.city_id
                LEFT JOIN stream as st ON ci.primary_stream_id = st.stream_id
                WHERE ci.college_id = $1;
              `,
              [collegeId]
            );

            let collegeContent = "";

            let tocCounter = 1;
            const {
              college_name,
              founded_year,
              state_name,
              city_name,
              campus_size,
              UGC_approved,
              nacc_grade,
              stream_name,
              total_student,
            } = collegeInfo[0];

            if (college_name) {
              const [
                collegePlacement,
                uniqueStreams,
                totalCourses,
                collegeRanking,
                undergraduateCourses,
                postgraduateCourses,
                collegeRankings,
              ] = await Promise.all([
                this.dataSource.query(
                  `SELECT 
                  highest_package, avg_package, placement_percentage, top_recruiters, year
                FROM college_wise_placement 
                WHERE college_id = $1 
                ORDER BY updated_at DESC
                LIMIT 1;`,
                  [collegeId]
                ),
                this.dataSource.query(
                  `
               SELECT STRING_AGG(stream_name, ', ' ORDER BY sort_order, stream_name) AS stream_names
                FROM (
                    SELECT DISTINCT s.stream_name, 
                        CASE 
                            WHEN s.stream_id = ci.primary_stream_id AND s.stream_name != 'Others' THEN 0 
                            ELSE 1 
                        END AS sort_order
                    FROM college_wise_course AS cwc
                    LEFT JOIN course_group AS cg ON cwc.course_group_id = cg.course_group_id
                    LEFT JOIN stream AS s ON cg.stream_id = s.stream_id
                    LEFT JOIN college_info AS ci ON cwc.college_id = ci.college_id
                    WHERE cwc.college_id = $1 
                    AND cwc.is_active = TRUE
                    AND s.stream_name IS NOT NULL
                ) AS sorted_streams;
                `,
                  [collegeId]
                ),
                this.dataSource.query(
                  `SELECT COUNT(*) from college_wise_course WHERE college_id = $1 AND is_active = true;`,
                  [collegeId]
                ),
                this.dataSource.query(
                  `
                    SELECT cr.category as ranking_category, cr.year as ranking_year, cr.rank, ra.name as ranking_agency_name
                    FROM college_ranking as cr 
                    LEFT JOIN ranking_agency as ra ON cr.ranking_agency_id = ra.ranking_agency_id 
                    WHERE cr.college_id = $1 
                    AND cr.category IS NOT NULL 
                    AND cr.year IS NOT NULL
                    AND cr.ranking_agency_id IS NOT NULL
                    AND ra.name IS NOT NULL
                    ORDER BY rank ASC, year DESC
                    LIMIT 1;`,
                  [collegeId]
                ),
                this.dataSource.query(
                  `SELECT cwc.duration, cwc.fees, cwc.name 
                      FROM college_wise_course AS cwc
                      JOIN course_group AS cg
                      ON cwc.course_group_id = cg.course_group_id
                      WHERE cwc.college_id = $1 
                        AND cwc.duration_type = 'years' 
                        AND cwc.duration IS NOT NULL 
                        AND cwc.fees IS NOT NULL 
                        AND cwc.name IS NOT NULL 
                        AND cwc.is_active = TRUE
                        AND cg.level = 'Graduation'
                      ORDER BY cwc.college_wise_course_id
                      LIMIT 5;`,
                  [collegeId]
                ),
                this.dataSource.query(
                  `SELECT cwc.duration, cwc.fees, cwc.name 
                        FROM college_wise_course AS cwc
                        JOIN course_group AS cg
                        ON cwc.course_group_id = cg.course_group_id
                        WHERE cwc.college_id = $1 
                          AND cwc.duration_type = 'years' 
                          AND cwc.duration IS NOT NULL 
                          AND cwc.fees IS NOT NULL 
                          AND cwc.name IS NOT NULL 
                          AND cwc.is_active = TRUE
                          AND cg.level = 'Post Graduation'
                        ORDER BY cwc.college_wise_course_id
                        LIMIT 5;`,
                  [collegeId]
                ),
                this.dataSource.query(
                  `
                  SELECT cr.category as ranking_category, cr.year as ranking_year, cr.rank, ra.name as ranking_agency_name
                  FROM college_ranking as cr 
                  LEFT JOIN ranking_agency as ra ON cr.ranking_agency_id = ra.ranking_agency_id 
                  WHERE cr.college_id = $1 
                  AND cr.category IS NOT NULL 
                  AND cr.year IS NOT NULL
                  AND cr.ranking_agency_id IS NOT NULL
                  AND ra.name IS NOT NULL
                  ORDER BY year DESC, rank ASC
                  LIMIT 10;`,
                  [collegeId]
                ),
              ]);

              // *********** SECTION 1 (Introduction) ***********
              {
                const truthCondition =
                  (founded_year &&
                    founded_year.trim() &&
                    state_name &&
                    city_name) ||
                  campus_size ||
                  (UGC_approved && nacc_grade && stream_name) ||
                  (collegeRanking && collegeRanking[0]) ||
                  (total_student && !isNaN(Number(total_student)));

                if (truthCondition) {
                  collegeContent += "<section class='article-content-body'>";
                  collegeContent += `<h2 id="toc-${tocCounter++}" class="content-title">Introduction to ${college_name}</h2>`;
                }

                // Paragraph 1.
                if (
                  (founded_year &&
                    founded_year.trim() &&
                    state_name &&
                    city_name) ||
                  campus_size ||
                  (UGC_approved && nacc_grade && stream_name)
                ) {
                  collegeContent += `<p class="content-item">`;
                }

                if (
                  founded_year &&
                  founded_year.trim() &&
                  state_name &&
                  city_name
                ) {
                  collegeContent += `${college_name}, established in <b>${founded_year}</b>, is located in ${city_name}, ${state_name}. `;
                }
                if (campus_size) {
                  collegeContent += `The campus spans <b>${campus_size} acres</b>, offering world-class facilities and a vibrant learning environment. `;
                }
                if (UGC_approved && nacc_grade && stream_name) {
                  collegeContent += `Accredited by NAAC and recognized by UGC, the institute is known for its excellence in ${stream_name}.`;
                }
                if (
                  (founded_year &&
                    founded_year.trim() &&
                    state_name &&
                    city_name) ||
                  campus_size ||
                  (UGC_approved && nacc_grade && stream_name)
                ) {
                  collegeContent += `</p>`;
                }

                // Paragraph 2.
                if (
                  (collegeRanking && collegeRanking[0]) ||
                  (total_student && !isNaN(Number(total_student)))
                ) {
                  collegeContent += `<p class="content-item">`;
                }

                if (collegeRanking && collegeRanking[0]) {
                  const {
                    ranking_category,
                    ranking_year,
                    rank,
                    ranking_agency_name,
                  } = collegeRanking[0];

                  if (
                    ranking_category &&
                    ranking_year &&
                    rank &&
                    ranking_agency_name
                  ) {
                    collegeContent += `Ranked <b>${rank} in ${ranking_category}</b> by <b>${ranking_agency_name}, ${ranking_year}</b>, ${college_name} attracts students from across the globe for its global partnerships and research excellence. `;
                  }
                }

                if (total_student && !isNaN(Number(total_student))) {
                  collegeContent += `The institute enrolls over <b>${total_student} students annually</b>.`;
                }
                if (
                  (collegeRanking && collegeRanking[0]) ||
                  (total_student && !isNaN(Number(total_student)))
                ) {
                  collegeContent += `</p>`;
                }

                if (truthCondition) {
                  collegeContent += "</section>";
                }
              }

              // *********** SECTION 2 (Why Choose?) ***********
              {
                collegeContent += "<section class='article-content-body'>";
                collegeContent += `<h2 id="toc-${tocCounter++}" class="content-title">Why Choose ${college_name}?</h2>`;
                collegeContent += `<div class="table-container-p"><table><tbody>`;
                collegeContent += `<tr><th>Key Metric</th><th>Details</th></tr>`;

                // Insert rows accordingly
                if (founded_year && founded_year.trim()) {
                  collegeContent += `<tr><td>Year of Establishment</td><td>${founded_year}</td></tr>`;
                }

                if (city_name && state_name) {
                  collegeContent += `<tr><td>Location</td><td>${city_name}, ${state_name}</td></tr>`;
                }

                if (
                  totalCourses &&
                  totalCourses[0] &&
                  totalCourses[0].count &&
                  totalCourses[0].count != 0
                ) {
                  collegeContent += `<tr><td>Total Programs Offered</td><td>${totalCourses[0].count}</td></tr>`;
                }

                if (
                  uniqueStreams &&
                  uniqueStreams[0] &&
                  uniqueStreams[0].stream_names
                ) {
                  collegeContent += `<tr><td>Streams Available</td><td>${uniqueStreams[0].stream_names}</td></tr>`;
                }

                // Campus Area
                if (campus_size) {
                  collegeContent += `<tr><td>Campus Area</td><td>${campus_size} acers</td></tr>`;
                }

                if (collegePlacement && collegePlacement[0]) {
                  const {
                    highest_package,
                    avg_package,
                    placement_percentage,
                    top_recruiters,
                  } = collegePlacement[0];
                  if (placement_percentage) {
                    collegeContent += `<tr><td>Placement Rate (%)</td><td>${placement_percentage}</td></tr>`;
                  }
                  if (avg_package) {
                    collegeContent += `<tr><td>Average Package (₹)</td><td>${avg_package}</td></tr>`;
                  }
                  if (highest_package) {
                    collegeContent += `<tr><td>Highest Package (₹)</td><td>${highest_package}</td></tr>`;
                  }
                  if (top_recruiters) {
                    collegeContent += `<tr><td>Top Recruiters</td><td>${top_recruiters}</td></tr>`;
                  }
                }

                // Student Enrollment
                if (total_student && !isNaN(Number(total_student))) {
                  collegeContent += `<tr><td><b>Student Enrollment</b></td><td>${total_student}</td></tr>`;
                }

                collegeContent += `</tbody></table></div>`;
                collegeContent += "</section>";
              }

              // *********** SECTION-3 (Courses and Fees) ***********
              {
                if (
                  undergraduateCourses?.length ||
                  postgraduateCourses?.length
                ) {
                  collegeContent += "<section class='article-content-body'>";
                  collegeContent += `<h2 id="toc-${tocCounter++}" class="content-title">Courses and Fees</h2>`;
                  collegeContent += `<p class="content-item">${college_name} offers programs at undergraduate, postgraduate, and doctoral levels. Below are the details of some of the popular courses:</p>`;

                  // Undergraduate Programs
                  collegeContent += this.courseTableGenerator(
                    "Undergraduate Programs",
                    undergraduateCourses
                  );
                  // Postgraduate Programs
                  collegeContent += this.courseTableGenerator(
                    "Postgraduate Programs",
                    postgraduateCourses
                  );

                  collegeContent += "</section>";
                }
              }

              // *********** SECTION-4 ([College Name] Placement Statistics [Year]) ***********
              {
                if (collegePlacement && collegePlacement[0]) {
                  const {
                    placement_percentage,
                    highest_package,
                    avg_package,
                    top_recruiters,
                    year,
                  } = collegePlacement[0];

                  if (
                    year &&
                    (placement_percentage ||
                      highest_package ||
                      avg_package ||
                      top_recruiters)
                  ) {
                    collegeContent += "<section class='article-content-body'>";
                    collegeContent += `<h2 id="toc-${tocCounter++}" class="content-title">${college_name} Placement Statistics ${year}</h2>`;
                    collegeContent += `<div class="table-container-p"><table><tbody>`;
                    collegeContent += `<tr><th>Key Metric</th><th>Details</th></tr>`;

                    if (placement_percentage) {
                      collegeContent += `<tr><td>Placement Rate (%)</td><td>${placement_percentage}</td></tr>`;
                    }
                    if (highest_package) {
                      collegeContent += `<tr><td>Highest Package (₹)</td><td>${highest_package}</td></tr>`;
                    }
                    if (avg_package) {
                      collegeContent += `<tr><td>Average Package (₹)</td><td>${avg_package}</td></tr>`;
                    }
                    if (top_recruiters) {
                      collegeContent += `<tr><td>Top Recruiters</td><td>${top_recruiters}</td></tr>`;
                    }

                    collegeContent += `</tbody></table></div>`;
                    collegeContent += "</section>";
                  }
                }
              }

              // *********** SECTION-5 ([College Name] Rankings [Year]) ***********
              {
                if (collegeRankings && collegeRankings.length) {
                  collegeContent += "<section class='article-content-body'>";
                  collegeContent += `<h2 id="toc-${tocCounter++}" class="content-title">${college_name} Rankings ${collegeRankings[0].ranking_year}</h2>`;
                  collegeContent += `<p class="content-item"><b>Some of the notable ${college_name} rankings are listed in the table below: </b></p>`;

                  // Construction Ranking Table
                  collegeContent +=
                    this.rankingsTableGenerator(collegeRankings);

                  collegeContent += "</section>";
                }
              }

              // *********** SECTION-5 (FAQs) ***********
              {
                const truthCondition =
                  (collegePlacement &&
                    collegePlacement[0] &&
                    collegePlacement[0].highest_package) ||
                  (totalCourses &&
                    totalCourses[0] &&
                    totalCourses[0].count &&
                    totalCourses[0].count != 0 &&
                    uniqueStreams &&
                    uniqueStreams[0] &&
                    uniqueStreams[0].stream_names);

                if (truthCondition) {
                  collegeContent += `<section class="article-content-body">`;
                  collegeContent += `<h2 id="toc-${tocCounter++}" class="content-title">FAQs</h2>`;
                }

                if (
                  collegePlacement &&
                  collegePlacement[0] &&
                  collegePlacement[0].highest_package
                ) {
                  collegeContent += `<details class="faq-item">`;
                  collegeContent += `<summary class="faq-ques">What is the highest package offered at ${college_name}?</summary>`;
                  collegeContent += `<p class="faq-ans">₹${collegePlacement[0].highest_package}</p>`;
                  collegeContent += `</details>`;
                }

                if (
                  totalCourses &&
                  totalCourses[0] &&
                  totalCourses[0].count &&
                  totalCourses[0].count != 0 &&
                  uniqueStreams &&
                  uniqueStreams[0] &&
                  uniqueStreams[0].stream_names
                ) {
                  collegeContent += `<details class="faq-item">`;
                  collegeContent += `<summary class="faq-ques">How many programs does ${college_name} offer?</summary>`;
                  collegeContent += `<p class="faq-ans">${totalCourses[0].count} programs across ${uniqueStreams[0].stream_names}.</p>`;
                  collegeContent += `</details>`;
                }

                if (truthCondition) {
                  collegeContent += "</section>";
                }
              }
            }

            templatizedList.push({
              college_id: collegeId,
              silos: silos_name,
              description: collegeContent,
              is_active: false,
            });
          })
        );

        return templatizedList;
      } else {
        return [];
      }
    });
  }

  courseTableGenerator(
    courseProgram: string,
    courses: { [key: string]: any }[]
  ) {
    let courseSection = ``;
    if (courses.length) {
      courseSection += `<p><b>${courseProgram}</b></p>`;
      courseSection += `<div class="table-container-p"><table><tbody>`;
      courseSection += `<tr><th>Course Name</th><th>Fees (Per Year)</th><th>Eligibility</th><th>Duration</th></tr>`;
      courses.map((course: { [key: string]: any }) => {
        courseSection += `<tr><td>${course.name}</td><td>${course.fees / course.duration || "-"}</td><td>${courseProgram === "Undergraduate Programs" ? "10+2" : "Graduation"}</td><td>${course.duration} years</td></tr>`;
      });
      courseSection += `</tbody></table></div>`;
    }
    return courseSection;
  }

  rankingsTableGenerator(rankings: { [key: string]: any }[]) {
    let tableSection = ``;
    tableSection += `<div class="table-container-p"><table><tbody>`;
    tableSection += `<tr><th>Ranking Body</th><th>Year</th><th>Category</th><th>Rank</th></tr>`;
    rankings.map((rank: { [key: string]: any }) => {
      tableSection += `<tr><td>${rank.ranking_agency_name}</td><td>${rank.ranking_year || "-"}</td><td>${rank.ranking_category || "-"}</td><td>${rank.rank}</td></tr>`;
    });
    tableSection += `</tbody></table></div>`;
    return tableSection;
  }

  updateCollegeTemplatization(
    templatization_id: number,
    data: UpdateTemplatizationDto,
    user_id: number
  ) {
    return tryCatchWrapper(async () => {
      const updatedTemplatization = await this.dataSource.query(
        `
        UPDATE templatization_college_content 
        SET is_active = $1, description = $2 
        WHERE templatization_id = $3 
        RETURNING college_id;
        `,
        [data.is_active, data.description, templatization_id]
      );

      if (updatedTemplatization[0] && updatedTemplatization[0][0]) {
        await this.logsService.createLog(
          user_id,
          LogType.COLLEGE,
          `Successfully updated templized article of ${templatization_id}.`,
          2,
          RequestType.POST,
          updatedTemplatization[0][0].college_id,
          data
        );
      }

      return {
        success: true,
        message: "Successfully updated templized article.",
      };
    });
  }
}
