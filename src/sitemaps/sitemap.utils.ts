import { Article } from "../articles_modules/articles/articles.entity";
import { CollegeContent } from "../college/college-content/college-content.entity";
import { ExamContent } from "../exams_module/exam-content/exam_content.entity";

function escapeXml(unsafe: string): string {
  return unsafe
    ?.replace(/&/g, "&amp;")
    ?.replace(/</g, "&lt;")
    ?.replace(/>/g, "&gt;")
    ?.replace(/"/g, "&quot;")
    ?.replace(/'/g, "&apos;");
}

export function generateNewsSitemap(newsList: Article[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  let baseUrl = process?.env?.NODE_ENV === "stage"
      ? "https://stage.d20hg0ugac0vao.amplifyapp.com"
      : "https://www.kollegeapply.com";

      for (const news of newsList) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/news/${escapeXml(news.slug?.replace(/\s+/g, "-").toLowerCase())}-${news.article_id}</loc>\n`;
        xml += `    <news:news>\n`;
        xml += `      <news:publication>\n`;
        xml += `        <news:name>KollegeApply</news:name>\n`;
        xml += `        <news:language>en</news:language>\n`;
        xml += `      </news:publication>\n`;
        xml += `      <news:publication_date>${escapeXml(news.updated_at.toISOString().replace(/\.\d{3}Z$/, "Z"))}</news:publication_date>\n`;
        xml += `      <news:title>${escapeXml(news.title) ?? ""}</news:title>\n`;
        xml += `      <news:keywords>${escapeXml(news.meta_desc) ?? ""}</news:keywords>\n`;
        xml += `    </news:news>\n`;
        xml += `    <lastmod>${escapeXml(news.updated_at.toISOString().replace(/\.\d{3}Z$/, "Z"))}</lastmod>\n`;
    
        if (news.img1_url) {
            xml += `    <image:image>\n`;
            xml += `      <image:loc>${escapeXml(news.img1_url)}</image:loc>\n`;
            xml += `    </image:image>\n`;
        }
    
        xml += `  </url>\n`;
    }
    

  xml += `</urlset>\n`;
  return xml;
}

export function generateUpdatesSitemap(
  collegeContent: any[],
  examContent: any[]
): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  let baseUrl = process?.env?.NODE_ENV === "stage"
      ? "https://stage.d20hg0ugac0vao.amplifyapp.com"
      : "https://www.kollegeapply.com";

  for (const college of collegeContent) {
    const collegeUrl =
      college?.silo == "info"
        ? `${baseUrl}/colleges/${escapeXml(college?.college_slug?.replace(/\s+/g, "-")?.toLowerCase())}-${college?.college_id}/${escapeXml(college?.silos.replace(/_/g, "-"))}`
        : `${baseUrl}/colleges/${escapeXml(college?.college_slug?.replace(/\s+/g, "-")?.toLowerCase())}/${escapeXml(college?.silos.replace(/_/g, "-"))}`;
    xml += `  <url>\n`;
    xml += `    <loc>${collegeUrl}</loc>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `    <lastmod>${college?.updated_at?.toISOString().split("T")[0]}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `  </url>\n`;
  }

  for (const exam of examContent) {
    const examUrl = `${baseUrl}/exams/${escapeXml(exam?.exam_slug?.replace(/\s+/g, "-")?.toLowerCase())}-${exam?.exam_id}/${escapeXml(exam?.silos.replace(/_/g, "-"))}`;
    xml += `  <url>\n`;
    xml += `    <loc>${examUrl}</loc>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `    <lastmod>${exam?.updated_at?.toISOString().split("T")[0]}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

export function generateArticlesSitemap(articles: Article[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  let baseUrl = process?.env?.NODE_ENV === "stage"
      ? "https://stage.d20hg0ugac0vao.amplifyapp.com"
      : "https://www.kollegeapply.com";

  for (const article of articles) {
    xml += `  <url>\n`;
    // xml += `    <loc>${baseUrl}/courses-certifications/articles/${escapeXml(article.slug)}</loc>\n`;
    xml += `    <loc>${baseUrl}/articles/${escapeXml(article.slug)}</loc>\n`;
    xml += `    <lastmod>${article?.updated_at?.toISOString().split("T")[0]}</lastmod>\n`;
    xml += `    <changefreq>always</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}
//api
export function generateSitemapIndex(
  articleSitemapCount: number,
  newsSitemapCount: number,
  collegeContentCounts: Array<{ type: string; count: number }>,
  examContentCounts: Array<{ type: string; count: number }>
): string {
  const baseUrl =
    process?.env?.NODE_ENV === "stage"
      ? "https://stage.main.kollegeapply.com/sitemap"
      : "https://main.kollegeapply.com/sitemap";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Generate article sitemaps
  for (let i = 0; i < articleSitemapCount; i++) {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${baseUrl}/sitemap-articles_${i}.xml</loc>\n`;
    xml += `  </sitemap>\n`;
  }

  // Generate news sitemaps
  for (let i = 0; i < newsSitemapCount; i++) {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${baseUrl}/sitemap-news_${i}.xml</loc>\n`;
    xml += `  </sitemap>\n`;
  }

  // Generate college content sitemaps
  collegeContentCounts.forEach(({ type, count }) => {
    for (let i = 0; i < count; i++) {
      xml += `  <sitemap>\n`;
      xml += `    <loc>${baseUrl}/sitemap-college-${type}-${i}.xml</loc>\n`;
      xml += `  </sitemap>\n`;
    }
  });

  // Generate exam content sitemaps
  examContentCounts.forEach(({ type, count }) => {
    for (let i = 0; i < count; i++) {
      xml += `  <sitemap>\n`;
      xml += `    <loc>${baseUrl}/sitemap-exam-${type}-${i}.xml</loc>\n`;
      xml += `  </sitemap>\n`;
    }
  });

  xml += `</sitemapindex>\n`;
  return xml;
}


export function generateCollegeContentSitemap(
  collegeContent: CollegeContent[],
  silos: string
): string {
  let baseUrl = process?.env?.NODE_ENV === "stage"
  ? "https://stage.d20hg0ugac0vao.amplifyapp.com"
  : "https://www.kollegeapply.com";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  collegeContent.forEach((content) => {
    const url = (silos === 'info') ? `${baseUrl}/colleges/${content.college.slug.replace(/-\d+$/, "")}-${content.college_id}` : `${baseUrl}/colleges/${content.college.slug.replace(/-\d+$/, "")}-${content.college_id}/${silos.replace(/_/g, "-")}`;
    xml += `  <url>\n`;
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${content?.updated_at?.toISOString().split("T")[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  return xml;
}

export function generateExamContentSitemap(
  examContent: ExamContent[],
  silos: string
): string {
  let baseUrl = process?.env?.NODE_ENV === "stage"
  ? "https://stage.d20hg0ugac0vao.amplifyapp.com"
  : "https://www.kollegeapply.com";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  examContent.forEach((content) => {
    if(silos == 'exam_application_process'){
      silos = 'application-process'
    }
    else if(silos == 'exam_eligibility_criteria'){
      silos = 'eligibility-criteria'
    }
    else if(silos == 'cutoff'){
      silos = 'cut-off'
    }  
    const url =
      silos === "info"
        ? `${baseUrl}/exams/${content?.exam?.slug?.replace(/-\d+$/, "")}-${content?.exam_id}`
        : `${baseUrl}/exams/${content?.exam?.slug?.replace(/-\d+$/, "")}-${content?.exam_id}/${silos.replace(/_/g, "-")}`;

    xml += `  <url>\n`;
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${content?.updated_at?.toISOString().split("T")[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  return xml;
}

