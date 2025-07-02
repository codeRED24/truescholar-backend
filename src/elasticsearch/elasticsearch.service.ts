import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class MyElasticsearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async search(index: string, query: any) {
    return this.elasticsearchService.search({
      index,
      body: {
        query,
      },
    });
  }

  async indexData(index: string, data: any) {
    return this.elasticsearchService.index({
      index,
      body: data,
    });
  }
}
