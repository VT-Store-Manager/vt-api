import { Test, TestingModule } from '@nestjs/testing';
import { AdminApiController } from './admin-api.controller';
import { AdminApiService } from './admin-api.service';

describe('AdminApiController', () => {
  let adminApiController: AdminApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AdminApiController],
      providers: [AdminApiService],
    }).compile();

    adminApiController = app.get<AdminApiController>(AdminApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(adminApiController.getHello()).toBe('Hello World!');
    });
  });
});
