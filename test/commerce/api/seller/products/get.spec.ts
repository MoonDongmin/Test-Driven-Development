// declare global {
//   interface BigInt {
//     toJSON(): string;
//   }
// }

import {AppModule}                       from "@/app.module";
import {TextFixture}                     from "../../text-fixture";
import {
  Test,
  TestingModule,
}                                        from "@nestjs/testing";
import {INestApplication}                from "@nestjs/common";
import {UUID}                            from "node:crypto";
import {RegisterProductCommandGenerator} from "../../../register-product-command-generator";

describe("GET /seller/products/", () => {
  let app: INestApplication;
  let fixture;

  beforeEach(async () => {

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

    // Act
    const response = await fixture.client()
      .get(`/seller/products/`);

    // Assert
    expect(response.statusCode).toEqual(200);
  });


  // it("올바르게 요청하면 200 OK 상태코드를 반환한다", async () => {
  //   // Arrange
  //   await fixture.createSellerThenSetAsDefaultUser();
  //   const id: string = await fixture.registerProduct();
  //
  //   // Act
  //   const response = await fixture.client()
  //     .get(`/seller/products/${id}`);
  //
  //   // Assert
  //   expect(response.statusCode).toEqual(200);
  // });

  it("판매자가 등록한 모든 상품을 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const ids: UUID[] = await fixture.registerProducts();

    // Act
    const response = await fixture.client()
      .get(`/seller/products`);

    // Assert
    expect(response.body).toBeDefined();
    expect(response.body.length).toEqual(ids.length);
  });

  it("다른 판매자가 등록한 상품이 포함되지 않는다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const unexpected: UUID = await fixture.registerProduct();

    await fixture.createSellerThenSetAsDefaultUser();
    await fixture.registerProducts();

    // Act
    const response = await fixture.client()
      .get(`/seller/products`);

    // Assert
    expect(response.body).toBeDefined();
    expect(response.body.map(item => item.id)).not.toContainEqual(unexpected);
  });

  it("상품 정보를 올바르게 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const command = RegisterProductCommandGenerator.generateRegisterProductCommand();
    await fixture.registerProduct(command);

    // Act
    const response = await fixture.client()
      .get(`/seller/products`);

    // Assert
    const body = response.body;
    const actual = body[0];

    expect(actual).toBeDefined();
    expect(actual).toMatchObject({
      name: command.name,
      description: command.description,
      imageUri: command.imageUri,
      stockQuantity: command.stockQuantity,
      priceAmount: command.priceAmount,
    });
    // expect(actual.name).toEqual(command.name);
    // expect(actual.imageUri).toEqual(command.imageUri);
    // expect(actual.description).toEqual(command.description);
    // expect(actual.priceAmount).toEqual(command.priceAmount);
    // expect(actual.stockQuantity).toEqual(command.stockQuantity);
  });

  it("상품 등록 시각을 올바르게 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const referenceTime: Date = new Date(Date.now());
    await fixture.registerProduct();

    // Act
    const response = await fixture.client()
      .get(`/seller/products`);

    // Assert
    const body = response.body;
    const actual = body[0];

    const actualTime = new Date(actual.registeredTimeUtc).getTime();

    expect(actual).toBeDefined();
    expect(actualTime).toBeCloseTo(referenceTime.getTime(), -3);
  });

  it("상품 목록을 등록 시점 역순으로 정렬한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    await fixture.registerProducts();

    // Act
    const response = await fixture.client()
      .get(`/seller/products`);

    // Assert
    expect(response.body.map(item => item.registeredTimeUtc))
      .toEqual([...response.body.map(item => item.registeredTimeUtc)]
        .sort()
        .reverse());
  });
});
