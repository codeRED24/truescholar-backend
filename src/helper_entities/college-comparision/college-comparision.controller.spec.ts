import { Test, TestingModule } from '@nestjs/testing';
import { CollegeComparisionController } from './college-comparision.controller';

describe('CollegeComparisionController', () => {
  let controller: CollegeComparisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollegeComparisionController],
    }).compile();

    controller = module.get<CollegeComparisionController>(CollegeComparisionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
