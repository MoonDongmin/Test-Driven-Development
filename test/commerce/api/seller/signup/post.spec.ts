import {
    describe,
    beforeEach,
    it,
    expect,
}                              from "bun:test";
import {
    Test,
    TestingModule,
}                              from "@nestjs/testing";
import type {INestApplication} from "@nestjs/common";
import request                 from "supertest";
import {AppModule}             from "@/app.module";
import {CreateSellerCommand}   from "@/commerce/command/create-seller-command";

describe("Post /seller/signUp", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it("올바르게_요청하면_204_No_Content_상태코드를_반환한다", async () => {
        // Arrange
        const command: CreateSellerCommand = {
            email: "seller@test.com",
            username: "seller",
            password: "password",
        };

        // Act
        const response = await request(app.getHttpServer())
            .post("/seller/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(204);
    });
});
