import {INestApplication}                from "@nestjs/common";
import request, {Test}                   from "supertest";
import {CreateSellerCommand}             from "@/commerce/command/create-seller-command";
import {UsernameGenerator}               from "../username-generator";
import {EmailGenerator}                  from "../email-generator";
import {PasswordGenerator}               from "../password-generator";
import {RegisterProductCommandGenerator} from "../register-product-command-generator";
import {Repository}                      from "typeorm";
import {Product}                         from "@/commerce/product";

const {generateUsername} = UsernameGenerator;
const {generateEmail} = EmailGenerator;
const {generatePassword} = PasswordGenerator;

type AuthClient = {
  get: (url: string) => Test;
  post: (url: string) => Test;
  patch: (url: string) => Test;
  delete: (url: string) => Test;
}

export class TestFixture {
  private testClient: AuthClient;

  constructor(private app: INestApplication, private productRepository?: Repository<Product>) {
    this.app = app;
    this.app.init();
    this.testClient = request(this.app.getHttpServer());
  }

  public client() {
    return this.testClient;
  }

  public async createShopper(email: string, username: string, password: string) {
    let command: CreateSellerCommand = {
      email,
      username,
      password,
    };

    await this.testClient
      .post("/shopper/signUp")
      .send(command);
  }

  public async issueShopperToken(email: string, password: string) {
    const carrier = await this.client()
      .post("/shopper/issueToken")
      .send({
        email,
        password,
      });

    return carrier.body.accessToken;
  }

  public async issueSellerToken(email: string, password: string) {
    const carrier = await this.client()
      .post("/seller/issueToken")
      .send({
        email,
        password,
      });

    return carrier.body.accessToken;
  }

  public async createShopperThenIssueToken() {
    const email: string = generateEmail();
    const password: string = generatePassword();
    await this.createShopper(email, generateUsername(), password);

    return await this.issueShopperToken(email, password);
  }

  public async setShopperAsDefaultUser(email: string, password: string) {
    const token: string = await this.issueShopperToken(email, password);

    this.testClient = this.createDefaultTestClient(token);
  }

  public async setSellerAsDefaultUser(email: string, password: string) {
    const token: string = await this.issueSellerToken(email, password);

    this.testClient = this.createDefaultTestClient(token);
  }

  createDefaultTestClient(token: string) {
    const sever = this.app.getHttpServer();

    return {
      get: (url: string) => request(sever).get(url).set("Authorization", "Bearer " + token),
      post: (url: string) => request(sever).post(url).set("Authorization", "Bearer " + token),
      patch: (url: string) => request(sever).patch(url).set("Authorization", "Bearer " + token),
      delete: (url: string) => request(sever).delete(url).set("Authorization", "Bearer " + token),
    };
  }

  async createSellerThenSetAsDefaultUser(): Promise<void> {
    const email: string = generateEmail();
    const password: string = generatePassword();

    await this.createSeller(email, generateUsername(), password);
    await this.setSellerAsDefaultUser(email, password);
  }

  private async createSeller(email: string, username: string, password: string) {
    const command: CreateSellerCommand = {
      email,
      username,
      password,
    };

    await this.client()
      .post("/seller/signUp")
      .send(command);
  }

  async createShopperThenSetAsDefaultUser(): Promise<void> {
    const email: string = generateEmail();
    const password: string = generatePassword();

    await this.createShopper(email, generateUsername(), password);
    await this.setShopperAsDefaultUser(email, password);
  }

  async registerProduct(command?: RegisterProductCommandGenerator) {
    const cmd = command ?? RegisterProductCommandGenerator.generateRegisterProductCommand();
    const response = await this.client()
      .post("/seller/products")
      .send(cmd);

    const location: string = response.headers.location;
    const id: string = location.split("/")[3];

    return id;
  }

  public async registerProducts(count?: number) {
    if (count) {
      let ids: string[] = [];
      for (let i = 0; i < count; i++) {
        ids.push(await this.registerProduct());
      }

      return ids;
    }

    return [await this.registerProduct(), await this.registerProduct(), await this.registerProduct()];
  }

  public async deleteAllProducts() {
    await this.productRepository?.deleteAll();
  }

  public async getSeller(): Promise<any> {
    return this.client().get("/seller/me");
  }

  public async consumeProductPage() {
    const response = await this.client().get("/shopper/products");

    return response.body.continuationToken;
  }

  public async consumeTwoProductPages() {
    const token = await this.consumeProductPage();
    const response = await this.client().get(`/shopper/products?continuationToken=${token}`);

    return response.body.continuationToken;
  }
}
