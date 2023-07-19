import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationTokenController } from './authorization-token.controller';

describe('AuthorizationTokenController', () => {
  let controller: AuthorizationTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorizationTokenController],
    }).compile();

    controller = module.get<AuthorizationTokenController>(
      AuthorizationTokenController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
