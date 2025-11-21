import {
  Test,
  TestingModule,
}                              from "@nestjs/testing";
import type {INestApplication} from "@nestjs/common";
import {AppModule}             from "@/app.module";
import request                 from "supertest";
import {UsernameGenerator}     from "../../../username-generator";
import {EmailGenerator}        from "../../../email-generator";
import {PasswordGenerator}     from "../../../password-generator";
import {CreateSellerCommand}   from "@/commerce/command/create-seller-command";

describe("GET /seller/me", () => {
  let app: INestApplication;

  const {generateUsername} = UsernameGenerator;
  const {generateEmail} = EmailGenerator;
  const {generatePassword} = PasswordGenerator;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("올바르게 요청하면 200 OK 상태코드를 반환한다", async () => {
    // Arrange
    const email: string = generateEmail();
    const username: string = generateUsername();
    const password: string = generatePassword();

    let command: CreateSellerCommand = {
      email,
      username,
      password,
    };

    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    const carrier = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send({
        email,
        password,
      });

    const token = carrier.body.accessToken;

    // Act
    const response = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", "Bearer " + token);

    // Assert
    expect(response.statusCode).toEqual(200);

  });

  it("접근 토큰을 사용하지 않으면 401 Unauthorized 상태코드를 반환한다", async () => {
    // Arrange

    // Act
    const response = await request(app.getHttpServer())
      .get("/seller/me");

    // Assert
    expect(response.statusCode).toEqual(401);
  });

  it("서로 다른 판매자의 식별자는 서로 다르다", async () => {
    // Arrange
    const email1: string = generateEmail();
    const username1: string = generateUsername();
    const password1: string = generatePassword();

    let command1 = {
      email: email1,
      username: username1,
      password: password1,
    };
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command1);

    const carrier1 = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send({
        email: email1,
        password: password1,
      });
    const token1 = carrier1.body.accessToken;

    const email2: string = generateEmail();
    const username2: string = generateUsername();
    const password2: string = generatePassword();

    let command2 = {
      email: email2,
      username: username2,
      password: password2,
    };
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command2);

    const carrier2 = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send({
        email: email2,
        password: password2,
      });
    const token2 = carrier2.body.accessToken;

    // Act
    const response1 = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", "Bearer " + token1);

    const response2 = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", "Bearer " + token2);

    // Assert
    expect(response1.body.id).not.toEqual(response2.body.id);
  });

  it("같은 판매자의 식별자는 항상 같다", async () => {
    // Arrange
    const email: string = generateEmail();
    const username: string = generateUsername();
    const password: string = generatePassword();

    let command: CreateSellerCommand = {
      email,
      username,
      password,
    };

    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    const carrier1 = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send({
        email,
        password,
      });
    const token1: string = carrier1.body.accessToken;

    const carrier2 = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send({
        email,
        password,
      });
    const token2: string = carrier2.body.accessToken;

    // Act
    const response1 = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", "Bearer " + token1);

    const response2 = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", "Bearer " + token2);

    // Assert
    expect(response1.body.id).toEqual(response2.body.id);
  });

  it("판매자의 기본 정보가 올바르게 설정된다", async () => {
    // Arrange
    const email: string = generateEmail();
    const username: string = generateUsername();
    const password: string = generatePassword();

    let command: CreateSellerCommand = {
      email,
      username,
      password,
    };

    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    const carrier = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send({
        email,
        password,
      });
    const token: string = carrier.body.accessToken;

    // Act
    const response = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", "Bearer " + token);


    const actual = response.body;
    expect(actual).toBeDefined();

    // Assert
    expect(actual.email).toEqual(email);
    expect(actual.username).toEqual(username);
  });
});
