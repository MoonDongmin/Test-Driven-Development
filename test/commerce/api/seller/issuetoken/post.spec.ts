import {
    Test,
    TestingModule,
}                              from "@nestjs/testing";
import type {INestApplication} from "@nestjs/common";
import {AppModule}             from "@/app.module";
import {CreateSellerCommand}   from "@/commerce/command/create-seller-command";
import request                 from "supertest";
import {UsernameGenerator}     from "../../../username-generator";
import {EmailGenerator}        from "../../../email-generator";
import {PasswordGenerator}     from "../../../password-generator";
import {IssueSellerToken}      from "@/commerce/query/issue-seller-token";

describe("Post /seller/issueToken", () => {
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
        const email = generateEmail();
        const password = generatePassword();

        await request(app.getHttpServer())
            .post("/seller/signUp")
            .send({
                email,
                username: generateUsername(),
                password,
            });

        // Act
        const token: IssueSellerToken = {
            email,
            password,
        };

        const response = await request(app.getHttpServer())
            .post("/seller/issueToken")
            .send(token);

        // Assert
        expect(response.statusCode).toBe(200);
    });

});
