import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import { ConfigModule } from '@nestjs/config';

describe('TokensService', () => {
  let service: TokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [TokensService],
    }).compile();

    service = module.get<TokensService>(TokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a token', () => {
    const token = service.generateToken<{ data: string; test: string }>({
      data: 'this is a test',
      test: 'another test',
    });

    expect(token).toBeDefined();
  });

  it('should validate an invalid token', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIIzLTA3LTE4VDE3OjA5OjI5Ljg1NFoiLCJuYW1lIjoiam9zZSIsImVtYWlsIjoicGVwZWpvc2VAb3V0bG.NdSkskanPnV-09q2g3gA_lsnKtat0vKtikXrXMAVw34c';
    const validation = service.validateToken(token);
    expect(validation).toBeFalsy();
  });

  it('should validate an valid token', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJjcmVhdGVkQXQiOiIyMDIzLTA3LTE4VDE3OjA5OjI5Ljg1NFoiLCJuYW1lIjoiam9zZSIsImVtYWlsIjoicGVwZWpvc2VAb3V0bG9vay5jb20ifSwiaWF0IjoxNjg5NzA2NjA0fQ.NIYnSBnPnV-09q2g3gA_lsnKtat0vKtikXrXMAVw34c';
    const validation = service.validateToken(token);
    expect(validation).toBeTruthy();
  });
});
