import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ElasticsearchController } from "./elasticsearch.controller";
import { MyElasticsearchService } from "./elasticsearch.service";

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        node: process.env.ELASTICSEARCH_NODE,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD,
        },
      }),
    }),
  ],
  exports: [ElasticsearchModule],
  controllers: [ElasticsearchController],
  providers: [MyElasticsearchService],
})
export class MyElasticsearchModule {}
