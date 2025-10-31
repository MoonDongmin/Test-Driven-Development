import {INestApplication}    from "@nestjs/common";
import request, {Test}       from "supertest";
import {CreateSellerCommand} from "@/commerce/command/create-seller-command";
import {UsernameGenerator}   from "../username-generator";
import {EmailGenerator}      from "../email-generator";
import {PasswordGenerator}   from "../password-generator";

const {generateUsername} = UsernameGenerator;
const {generateEmail} = EmailGenerator;
const {generatePassword} = PasswordGenerator;

type AuthClient = {
  get: (url: string) => Test;
  post: (url: string) => Test;
  patch: (url: string) => Test;
  delete: (url: string) => Test;
}

export class TextFixture {
  private testClient: AuthClient;

  constructor(private app: INestApplication) {
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
}
