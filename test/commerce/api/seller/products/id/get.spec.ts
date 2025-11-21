import {INestApplication}                from "@nestjs/common";
import {UsernameGenerator}               from "../../../../username-generator";
import {EmailGenerator}                  from "../../../../email-generator";
import {PasswordGenerator}               from "../../../../password-generator";
import {
  Test,
  TestingModule,
}                                        from "@nestjs/testing";
import {AppModule}                       from "@/app.module";
import {TextFixture}                     from "../../../text-fixture";
import {
  randomUUID,
  UUID,
}                                        from "node:crypto";
import {RegisterProductCommandGenerator} from "../../../../register-product-command-generator";

// declare global {
//   interface BigInt {
//     toJSON(): string;
//   }
// }

describe("GET /seller/products/{id}", () => {
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


  it("올바르게 요청하면 200 OK 상태코드를 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const id: string = await fixture.registerProduct();

    // Act
    const response = await fixture.client()
      .get(`/seller/products/${id}`);

    // Assert
    expect(response.statusCode).toEqual(200);
  });

  it("판매자가 아닌 사용자의 접근 토큰을 사용하면 403 Forbidden 상태코드를 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const id: string = await fixture.registerProduct();

    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
      .get(`/seller/products/${id}`);

    // Assert
    expect(response.statusCode).toEqual(403);
  });

  it("존재하지 않는 상품 식별자를 사용하면 404 Not Found 상태코드를 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const id: UUID = randomUUID();

    // Act
    const response = await fixture.client()
      .get(`/seller/products/${id}`);

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it("다른 판매자가 등록한 상품 식별자를 사용하면 404 Not Found 상태코드를 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const id: UUID = randomUUID();

    await fixture.createSellerThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
      .get(`/seller/products/${id}`);

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it("상품 식별자를 올바르게 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const id = await fixture.registerProduct();

    // Act
    const actual = await fixture.client()
      .get(`/seller/products/${id}`);

    // Assert
    expect(actual).toBeDefined();
    expect(actual.body.id).toEqual(id);
  });

  it("상품 정보를 올바르게 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const command = RegisterProductCommandGenerator.generateRegisterProductCommand();
    const id = await fixture.registerProduct(command);

    // Act
    const actual = await fixture.client()
      .get(`/seller/products/${id}`);

    // Assert
    expect(actual.body.name).toEqual(command.name);
    expect(actual.body.imageUri).toEqual(command.imageUri);
    expect(actual.body.description).toEqual(command.description);
    expect(actual.body.priceAmount).toEqual(command.priceAmount);
    expect(actual.body.stockQuantity).toEqual(command.stockQuantity);
  });

  it("상품 등록 시각을 올바르게 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const referenceTime: Date = new Date(Date.now());
    const id: string = await fixture.registerProduct();

    // Act
    const actual = await fixture.client().get("/seller/products/" + id).send();

    // Assert
    const actualTime = new Date(actual.body.registeredTimeUtc).getTime();

    // -3의 의미:
    // 10^3 = 1000 밀리초 = 1초 이내 차이 허용
    // 두 타임스탬프가 1초 이내에 있으면 테스트 통과
    expect(actualTime).toBeCloseTo(referenceTime.getTime(), -3);
  });
});
