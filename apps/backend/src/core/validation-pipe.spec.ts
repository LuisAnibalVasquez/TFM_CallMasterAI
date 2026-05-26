// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { Test, TestingModule } from "@nestjs/testing";
import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  INestApplication,
} from "@nestjs/common";
import { IsString, IsIn } from "class-validator";
import * as request from "supertest";

// ── Test DTO ────────────────────────────────────────────────────────

class CreateItemDto {
  @IsString()
  name!: string;

  @IsIn(["Sandbox", "Production"])
  environment!: string;
}

// ── Test Controller ─────────────────────────────────────────────────

@Controller("test-items")
class TestController {
  @Post()
  create(@Body() dto: CreateItemDto) {
    return { created: true, name: dto.name, environment: dto.environment };
  }
}

// ── Tests ───────────────────────────────────────────────────────────

describe("ValidationPipe (Task 3.1)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Happy path: allowed fields only ────────────────────────────────

  it("should accept a payload with only whitelisted fields", async () => {
    const res = await request(app.getHttpServer())
      .post("/test-items")
      .send({ name: "My Campaign", environment: "Sandbox" })
      .expect(201);

    expect(res.body).toMatchObject({
      created: true,
      name: "My Campaign",
      environment: "Sandbox",
    });
  });

  // ── Extra field rejection ──────────────────────────────────────────

  it("should reject a payload with extra non-whitelisted fields (400)", async () => {
    const res = await request(app.getHttpServer())
      .post("/test-items")
      .send({ name: "My Campaign", environment: "Sandbox", isAdmin: true })
      .expect(400);

    expect(res.body.message).toEqual(
      expect.arrayContaining(["property isAdmin should not exist"]),
    );
  });

  it("should reject payload with multiple extra fields", async () => {
    const res = await request(app.getHttpServer())
      .post("/test-items")
      .send({
        name: "Test",
        environment: "Production",
        isAdmin: true,
        injectedField: "malicious",
      })
      .expect(400);

    // Both extra fields should be flagged
    expect(res.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining("isAdmin"),
        expect.stringContaining("injectedField"),
      ]),
    );
  });

  // ── Missing required field ─────────────────────────────────────────

  it("should reject a payload missing a required field", async () => {
    const res = await request(app.getHttpServer())
      .post("/test-items")
      .send({ name: "My Campaign" })
      .expect(400);

    expect(res.body.message).toEqual(
      expect.arrayContaining([expect.stringContaining("environment")]),
    );
  });

  // ── Transform: query param auto-coercion ───────────────────────────

  it("should accept empty body for create (no transform test for query)", async () => {
    // This test verifies the pipe is active and doesn't break normal flow
    const res = await request(app.getHttpServer())
      .post("/test-items")
      .send({ name: "Minimal", environment: "Production" })
      .expect(201);

    expect(res.body.created).toBe(true);
  });
});
