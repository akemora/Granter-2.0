import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { UserEntity } from "../src/database/entities/user.entity";
import { applyTestAppConfig } from "./utils/test-app";

describe("Auth e2e", () => {
  let app: INestApplication;
  let httpServer: request.SuperTest<request.Test>;
  let dataSource: DataSource;

  const credentials = {
    email: "e2e@example.com",
    password: "StrongPassword123",
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = "a".repeat(64);
    process.env.SERVICE_TOKEN = "s".repeat(32);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = applyTestAppConfig(moduleFixture.createNestApplication());

    await app.init();
    dataSource = moduleFixture.get(DataSource);
    httpServer = request(app.getHttpServer());
  });

  beforeEach(async () => {
    await dataSource.getRepository(UserEntity).delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  it("registers a user and sets auth cookies", async () => {
    const response = await httpServer.post("/auth/register").send(credentials).expect(201);
    expect(response.body.data.email).toBe(credentials.email);
    const cookies = response.headers["set-cookie"] ?? [];
    expect(cookies.join(";")).toContain("access_token=");
    expect(cookies.join(";")).toContain("refresh_token=");
    expect(cookies.join(";")).toContain("csrf_token=");
  });

  it("rejects duplicate registration", async () => {
    await httpServer.post("/auth/register").send(credentials).expect(201);
    await httpServer.post("/auth/register").send(credentials).expect(400);
  });

  it("logs in with valid credentials and sets cookies", async () => {
    await httpServer.post("/auth/register").send(credentials).expect(201);
    const login = await httpServer.post("/auth/login").send(credentials).expect(200);
    expect(login.body.data.email).toBe(credentials.email);
    const cookies = login.headers["set-cookie"] ?? [];
    expect(cookies.join(";")).toContain("access_token=");
  });

  it("rejects invalid login attempts", async () => {
    await httpServer
      .post("/auth/login")
      .send({ email: credentials.email, password: "InvalidPassword123" })
      .expect(401);
  });

  it("returns the authenticated user", async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.post("/auth/register").send(credentials).expect(201);
    const me = await agent.get("/auth/me").expect(200);
    expect(me.body.data.email).toBe(credentials.email);
  });

  it("rejects missing JWT on protected route", async () => {
    await httpServer.get("/auth/me").expect(401);
  });

  it("rejects invalid JWT tokens", async () => {
    await httpServer.get("/auth/me").set("Authorization", "Bearer invalid").expect(401);
  });
});
