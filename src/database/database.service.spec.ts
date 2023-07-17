import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ConfigModule } from '@nestjs/config';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [DatabaseService],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a fauna instance', async () => {
    const fauna = service.getFaunaInstance();
    const ping = await fauna.ping();
    expect(ping).toBe('Scope write is OK');
  });

  it('should create a new collection', async () => {
    const newCollection: any = await service.createCollection('NewCollection');
    expect(newCollection.name).toBe('NewCollection');
  });

  it('should delete the new collection', async () => {
    const newCollection: any = await service.deleteCollection('NewCollection');
    expect(newCollection.name).toBe('NewCollection');
  });
});
