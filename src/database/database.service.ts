import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'faunadb';
@Injectable()
export class DatabaseService {
  constructor(private configService: ConfigService) {}

  private serverkey = this.configService.get<string>('FAUNA_SERVER_SECRET');
  private faunaClient: Client | null = null;

  getFaunaInstance(): Client {
    if (this.faunaClient != null) {
      return this.faunaClient;
    }
    this.faunaClient = new Client({ secret: this.serverkey });
    return this.faunaClient;
  }
}
