import { Author } from "../../articles_modules/author/author.entity";
import { CollegeContent } from "../college-content/college-content.entity";

export const mapContentBySilos = (
  collegeContents: CollegeContent[],
  silos: string,
  authorMap: Map<number, Author>
) => {
  try {
    let firstNewsItem = true; // Flag to track the first news item

    return collegeContents
      .filter((content) => content.is_active && content.silos === silos)
      .map((content) => {
        const author = authorMap.get(content.author_id);
        const baseObject = {
          id: content.college_content_id,
          silos: content.silos,
          title: content.title,
          seo_param: content.seo_param,
          updated_at: content.updated_at,
          is_active: content.is_active,
          author_name: author ? author.view_name : null,
          author_id: author ? author.author_id : null,
          author_image: author ? author.image : null,
          meta_desc: content.meta_desc,
        };

        if (silos === "news") {
          if (firstNewsItem) {
            firstNewsItem = false; // Mark that we've handled the first item
            return { ...baseObject, description: content.description }; // Include description
          }
          return baseObject; // Exclude description for all other items
        }

        return { ...baseObject, description: content.description }; // Keep description for other silos
      });
      
  } catch (error) {
    console.log(error);
    return [];
  }
};
