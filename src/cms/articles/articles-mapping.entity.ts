import { Article } from "../../articles_modules/articles/articles.entity";
import { ArticleTagType } from "../../common/enums";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity({name: "articles_mapping"})
export class ArticleMapping {

    @PrimaryGeneratedColumn('increment')
    articles_mapping_id: number;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @CreateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @Column({
        type: "enum",
        enum: ArticleTagType,
    })
    tag_type: ArticleTagType;

    @Column("int")
    tag_type_id: number;

    @ManyToOne(() => Article, {onDelete: "CASCADE"})
            @JoinColumn({name: "article_id"})
            article_id: Article;

}