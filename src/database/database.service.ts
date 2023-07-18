import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  Collection,
  CreateCollection,
  CreateIndex,
  CurrentIdentity,
  Delete,
  Get,
  Index,
  Match,
  Paginate,
} from 'faunadb';
@Injectable()
export class DatabaseService {
  constructor(private configService: ConfigService) {}

  private serverkey = this.configService.get<string>('FAUNA_SERVER_SECRET');
  private faunaClient: Client | null = null;

  getFaunaInstance(userToken?: string): Client {
    if (userToken) {
      return new Client({ secret: userToken });
    }
    if (this.faunaClient != null) {
      return this.faunaClient;
    }
    this.faunaClient = new Client({ secret: this.serverkey });
    return this.faunaClient;
  }

  createCollection(collection: string) {
    const client = this.getFaunaInstance();
    return client.query(CreateCollection({ name: collection }));
  }

  deleteCollection(collection: string) {
    const client = this.getFaunaInstance();
    return client.query(Delete(Collection(collection)));
  }

  createIndex(
    collection: string,
    unique: boolean,
    data: { name: string; terms: string[][]; values?: string[][] },
  ) {
    const client = this.getFaunaInstance();
    return client.query(
      CreateIndex({
        name: data.name,
        unique,
        source: Collection(collection),
        terms: data.terms.map((term) => {
          return {
            field: term,
          };
        }),
        values: data.values?.map((field) => {
          return {
            field: field,
          };
        }),
      }),
    );
  }

  deleteIndex(index: string) {
    const client = this.getFaunaInstance();
    return client.query(Delete(Index(index)));
  }

  callIndex(index: string, value: string) {
    const client = this.getFaunaInstance();
    return client.query(Paginate(Match(Index(index), value)));
  }

  async getIdentityFromClient(userClient: Client) {
    const userRef = await userClient.query(CurrentIdentity());
    if (userRef) {
      return userClient.query(Get(userRef));
    }
    return {};
  }

  async seedUsers() {
    await this.createCollection('users');
    await this.createIndex('users', true, {
      name: 'get_users_by_email',
      terms: [['data', 'email']],
      values: [],
    });
  }
}
