import type {INestApplication} from "@nestjs/common";
import {UsernameGenerator}     from "../../../username-generator";
import {EmailGenerator}        from "../../../email-generator";
import {PasswordGenerator}     from "../../../password-generator";
import {
  Test,
  TestingModule,
}                              from "@nestjs/testing";
import {AppModule}             from "@/app.module";
import {TestFixture}           from "../../test-fixture";

describe("GET /shopper/me", () => {
  let app: INestApplication;
  let fixture;

  const {generateUsername} = UsernameGenerator;
  const {generateEmail} = EmailGenerator;
  const {generatePassword} = PasswordGenerator;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    fixture = new TestFixture(app);
    await app.init();
  });


  it("올바르게 요청하면 200 OK 상태코드를 반환한다", async () => {
    // Arrange
    const email: string = generateEmail();
    const password: string = generatePassword();

    await fixture.createShopper(email, generateUsername(), password);
    const token = await fixture.issueShopperToken(email, password);

    // Act
    const response = await fixture.client()
      .get("/shopper/me")
      .set("Authorization", "Bearer " + token);

    // Assert
    expect(response.statusCode).toEqual(200);
  });

  it("접근 토큰을 사용하지 않으면 401 Unauthorized 상태코드를 반환한다", async () => {
    // Act
    const response = await fixture.client()
      .get("/shopper/me");

    // Assert
    expect(response.statusCode).toEqual(401);
  });

  it("서로 다른 구매자의 식별자는 서로 다르다", async () => {
    // Arrange
    const token1 = await fixture.createShopperThenIssueToken();
    const token2 = await fixture.createShopperThenIssueToken();

    // Act
    const response1 = await fixture.client()
      .get("/shopper/me")
      .set("Authorization", "Bearer " + token1);

    const response2 = await fixture.client()
      .get("/shopper/me")
      .set("Authorization", "Bearer " + token2);

    // Assert
    expect(response1.body.id).not.toEqual(response2.body.id);
  });

  it("같은 구매자의 식별자는 항상 같다", async () => {
    // Arrange
    const email = generateEmail();
    const password = generatePassword();

    await fixture.createShopper(email, generateUsername(), password);
    const token1 = await fixture.issueShopperToken(email, password);
    const token2 = await fixture.issueShopperToken(email, password);

    // Act
    const response1 = await fixture.client()
      .get("/shopper/me")
      .set("Authorization", "Bearer " + token1);

    const response2 = await fixture.client()
      .get("/shopper/me")
      .set("Authorization", "Bearer " + token2);

    // Assert
    expect(response1.body.id).toEqual(response2.body.id);
  });

  it("구매자의 기본 정보가 올바르게 설정된다", async () => {
    // Arrange
    const email = generateEmail();
    const password = generatePassword();
    const username = generateUsername();

    await fixture.createShopper(email, username, password);
    await fixture.setShopperAsDefaultUser(email, password);

    // Act
    const actual = await fixture.client().get("/shopper/me");

    // Assert
    expect(actual.body.email).toEqual(email);
    expect(actual.body.username).toEqual(username);
  });
});
