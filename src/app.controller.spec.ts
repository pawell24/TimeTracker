import * as supertest from 'supertest';
import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { UsersModule } from './users/users.module';

describe('AppController (e2e)', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UsersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/GET health should return "OK"', async () => {
    const res = await supertest(app.getHttpServer()).get('/health');
    expect(res.status).to.equal(200);
    expect(res.text).to.equal('OK');
  });
});
