import type {INestApplication}           from "@nestjs/common";
import {UsernameGenerator}               from "../../../username-generator";
import {EmailGenerator}                  from "../../../email-generator";
import {PasswordGenerator}               from "../../../password-generator";
import {
  Test,
  TestingModule,
}                                        from "@nestjs/testing";
import {AppModule}                       from "@/app.module";
import {TextFixture}                     from "../../text-fixture";
import {RegisterProductCommandGenerator} from "../../../register-product-command-generator";
import path                              from "node:path";

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

describe("POST /seller/products", () => {
  let app: INestApplication;
  let fixture;

  const {generateUsername} = UsernameGenerator;
  const {generateEmail} = EmailGenerator;
  const {generatePassword} = PasswordGenerator;

  beforeAll(async () => {

    BigInt.prototype.toJSON = function () {
      return this.toString();
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    fixture = new TextFixture(app);
    await app.init();
  });


  it("올바르게 요청하면 201 Created 상태코드를 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
      .post("/seller/products")
      .send(RegisterProductCommandGenerator.generateRegisterProductCommand());


    // Assert
    expect(response.statusCode).toEqual(201);
  });

  it("판매자가 아닌 사용자의 접근 토큰을 사용하면 403 Forbidden 상태코드를 반환한다", async () => {
    // Arrange
    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
      .post("/seller/products")
      .send(RegisterProductCommandGenerator.generateRegisterProductCommand());

    // Assert
    expect(response.statusCode).toEqual(403);
  });

  it.each(["invalid", "http://", "://missing-scheme.com"])("imageUri 속성이 URI 형식을 따르지 않으면 400 Bad Request 상태코드를 반환한다", async (imageUri: string) => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
      .post("/seller/products")
      .send(RegisterProductCommandGenerator.generateRegisterProductCommandWithOutImageUri(imageUri));

    // Assert
    expect(response.statusCode).toEqual(400);
  });

  it("올바르게 요청하면 등록된 상품 정보에 접근하는 Location 헤더를 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
      .post("/seller/products")
      .send(RegisterProductCommandGenerator.generateRegisterProductCommand());

    // Assert
    function endsWithUUID(path: string) {
      const segments: string[] = path.split("/");
      const lastSegment = segments[segments.length - 1];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(lastSegment);
    }

    const actual = response.headers.location;
    console.log(response.headers.location);

    expect(actual).toBeDefined();
    expect(path.isAbsolute(actual)).toBeTruthy();
    expect(actual).toContain("/seller/products");
    expect(endsWithUUID(actual)).toBeTruthy();
  });
});
