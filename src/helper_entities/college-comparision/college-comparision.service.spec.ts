import { Test, TestingModule } from '@nestjs/testing';
import { CollegeComparisionService } from './college-comparision.service';

describe('CollegeComparisionService', () => {
  let service: CollegeComparisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollegeComparisionService],
    }).compile();

    service = module.get<CollegeComparisionService>(CollegeComparisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
