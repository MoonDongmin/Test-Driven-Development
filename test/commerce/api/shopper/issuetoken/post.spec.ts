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
import {CreateShopperCommand}  from "@/commerce/command/create-shopper-command";
import {IssueShopperToken}     from "@/commerce/query/issue-shopper-token";

expect.extend({
    toBeValidBase64UrlJson(received) {
        if (typeof received !== "string") {
            return {
                pass: false,
                message: () => `expected a string, but received ${typeof received}}`,
            };
        }

        try {
            Buffer.from(received, "base64url").toString("utf-8");
            return {
                pass: true,
                message: () =>
                    `expected "${received}" not be a valid Base64-URL encoded string`,
            };
        } catch (e) {
            return {
                pass: false,
                message: () => `expected "${received}" not be a valid Base64-URL encoded string, 
                but it failed to decoded. \nError: ${e.message}`,
            };
        }
    },
});

describe("Post /shopper/issueToken", () => {
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

    it("올바르게 요청하면 200 OK 상태코드와 접근 토큰을 반환한다", async () => {
        // Arrange
        const email: string = generateEmail();
        const password: string = generatePassword();

        await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(new CreateShopperCommand(email, generateUsername(), password));

        // Act
        const token: IssueShopperToken = {
            email,
            password,
        };

        const response = await request(app.getHttpServer())
            .post("/shopper/issueToken")
            .send(token);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.accessToken).toBeDefined();
    });


    it("접근 토큰은 JWT 형식을 따른다", async () => {
        // Arrange
        const email: string = generateEmail();
        const password: string = generatePassword();

        await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send({
                email,
                username: generateUsername(),
                password,
            });

        // Act
        const token: IssueShopperToken = {
            email,
            password,
        };

        const response = await request(app.getHttpServer())
            .post("/shopper/issueToken")
            .send(token);

        // Assert
        const actual = response.body.accessToken;

        // @ts-ignore
        expect(actual).toSatisfy((value: string) => {
            const parts = value.split(".");
            expect(parts.length).toBe(3);

            // @ts-ignore
            expect(parts[0]).toBeValidBase64UrlJson();
            // @ts-ignore
            expect(parts[1]).toBeValidBase64UrlJson();
            // @ts-ignore
            expect(parts[2]).toBeValidBase64UrlJson();

            return true;
        });
    });

    it("존재하지 않는 이메일 주소가 사용되면 400 Bad Request 상태코드를 반환한다", async () => {
        // Arrange
        const email: string = generateEmail();
        const password: string = generatePassword();

        // Act
        const token: IssueShopperToken = {
            email,
            password,
        };

        const response = await request(app.getHttpServer())
            .post("/shopper/issueToken")
            .send(token);

        // Assert
        expect(response.statusCode).toEqual(400);
    });

    it("잘못된 비밀번호가 사용되면 400 Bad Request 상태코드를 반환한다", async () => {
        // Arrange
        const email = generateEmail();
        const password = generatePassword();
        const wrongPassword = generatePassword();

        await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send({
                email,
                username: generateUsername(),
                password,
            });
        // Act
        const token: IssueShopperToken = {
            email,
            password: wrongPassword,
        };

        const response = await request(app.getHttpServer())
            .post("/shopper/issueToken")
            .send(token);

        // Assert
        expect(response.statusCode).toBe(400);
    });

});
