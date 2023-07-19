import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationTokenService } from './authorization-token.service';

describe('AuthorizationTokenService', () => {
  let service: AuthorizationTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizationTokenService],
    }).compile();

    service = module.get<AuthorizationTokenService>(AuthorizationTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
