import { Injectable } from '@nestjs/common';
import { Client } from 'faunadb';
@Injectable()
export class DatabaseService {
  private serverkey = 'fnAFI220AgACWLtpjKze-Ar8a4ulO0rw4ItMhxnb';
  private faunaClient: Client | null = null;

  getFaunaInstance(): Client {
    if (this.faunaClient != null) {
      return this.faunaClient;
    }
    this.faunaClient = new Client({ secret: this.serverkey });
    return this.faunaClient;
  }
}
