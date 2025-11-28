import type {INestApplication}           from "@nestjs/common";
import {
  Test,
  TestingModule,
}                                        from "@nestjs/testing";
import {AppModule}                       from "@/app.module";
import {TestFixture}                     from "../../test-fixture";
import {Repository}                      from "typeorm";
import {Product}                         from "@/commerce/product";
import {getRepositoryToken}              from "@nestjs/typeorm";
import {RegisterProductCommandGenerator} from "../../../register-product-command-generator";
import {RegisterProductCommand}          from "@/commerce/command/register-product-command";
import {SellerView}                      from "@/commerce/view/seller-view";
import {SellerMeView}                    from "@/commerce/view/seller-me-view";
import {ProductView}                     from "@/commerce/view/product-view";
import {log}                             from "node:util";

describe("GET /shopper/products", () => {
  let app: INestApplication;
  let fixture;
  let productRepository: Repository<Product>;
  const PAGE_SIZE = 10;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    productRepository = moduleFixture.get(getRepositoryToken(Product));
    fixture = new TestFixture(app, productRepository);
    await app.init();
  });

  it("올바르게 요청하면 200 OK 상태코드를 반환한다", async () => {
    // Arrange
    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
      .get("/shopper/products");

    // Assert
    expect(response.statusCode).toEqual(200);
  });

  it("판매자 접근 토큰을 사용하면 403 Forbidden 상태코드를 반환한다", async () => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
      .get("/shopper/products");

    // Assert
    expect(response.statusCode).toEqual(403);
  });

  it("첫 번째 페이지의 상품을 반환한다", async () => {
    // Arrange
    await fixture.deleteAllProducts();

    await fixture.createSellerThenSetAsDefaultUser();
    const ids = await fixture.registerProducts(PAGE_SIZE);
    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
      .get("/shopper/products");

    // Assert
    const actual = response.body;
    expect(actual.items.map(item => item.id)).toEqual(ids.reverse());
    expect(actual).toBeDefined();
  });

  it("상품 목록을 등록 시점 역순으로 정렬한다", async () => {
    // Arrange
    await fixture.deleteAllProducts();

    await fixture.createSellerThenSetAsDefaultUser();

    const id1: string = await fixture.registerProduct();
    const id2: string = await fixture.registerProduct();
    const id3: string = await fixture.registerProduct();

    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
      .get("/shopper/products");

    // Assert
    expect(response.body.items.map(item => item.id)).toEqual([id3, id2, id1]);
  });

  it("상품 정보를 올바르게 반환한다", async () => {
    // Arrange
    await fixture.deleteAllProducts();

    await fixture.createSellerThenSetAsDefaultUser();
    const command: RegisterProductCommand = RegisterProductCommandGenerator.generateRegisterProductCommand();
    await fixture.registerProduct(command);

    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
      .get("/shopper/products");

    // Assert
    const actual = response.body.items[0];

    expect(actual).toMatchObject({
      name: command.name,
      description: command.description,
      imageUri: command.imageUri,
      stockQuantity: command.stockQuantity,
      priceAmount: command.priceAmount,
    });
  });

  it("판매자 정보를 올바르게 반환한다", async () => {
    // Arrange
    await fixture.deleteAllProducts();

    await fixture.createSellerThenSetAsDefaultUser();
    const seller = await fixture.getSeller();
    await fixture.registerProduct();

    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
      .get("/shopper/products");

    // Assert
    const actual = response.body.items[0].seller;

    expect(actual).toBeDefined();
    expect(actual.id).toEqual(seller.body.id);
    expect(actual.username).toEqual(seller.body.username);

  });
});

