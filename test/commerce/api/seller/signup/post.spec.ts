import {
    describe,
    beforeEach,
    it,
    expect,
    beforeAll,
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

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it("올바르게 요청하면 204 No Content 상태코드를 반환한다", async () => {
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

    it("email 속성이 지정되지 않으면 400 Bad Request 상태코드를 반환한다", async () => {
        // Arrange
        const command: CreateSellerCommand = {
            email: undefined,
            username: "seller",
            password: "password",
        };

        // Act
        const response = await request(app.getHttpServer())
            .post("/seller/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it.each([
        "invalid-email",
        "invalid-email@",
        "invalid-email@example",
        "invalid-email@example.",
        "invalid-email@.com",
    ])("email 속성이 올바른 형식을 따르지 않으면 400 Bad Request 상태코드를 반환한다", async (email: string) => {
        // Arrange
        const command: CreateSellerCommand = {
            email,
            username: "seller",
            password: "password",
        };

        // Act
        const response = await request(app.getHttpServer())
            .post("/seller/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it("username 속성이 지정되지 않으면 400 Bad Request 상태코드를 반환한다", async () => {
        // Arrange
        const command: CreateSellerCommand = {
            email: "seller@test.com",
            username: undefined,
            password: "password",
        };

        // Act
        const response = await request(app.getHttpServer())
            .post("/seller/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it.each([
        "",
        "se",
        "seller ",
        "seller.",
        "seller!",
        "seller@",
    ])("password 속성이 올바른 형식을 따르지 않으면 400 Bad Request 상태코드를 반환한다", async (username: string) => {
        const command: CreateSellerCommand = {
            email: "seller@test.com",
            username,
            password: "password",
        };

        // Act
        const response = await request(app.getHttpServer())
            .post("/seller/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it.each([
        "seller",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "0123456789",
        "seller_",
        "seller-",
    ])("username 속성이 올바른 형식을 따르면 204 No Content 상태코드를 반환한다", async (username: string) => {
        const command: CreateSellerCommand = {
            email: "seller@test.com",
            username,
            password: "password",
        };

        // Act
        const response = await request(app.getHttpServer())
            .post("/seller/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(204);
    });

    it("password 속성이 지정되지 않으면 400 Bad Request 상태코드를 반환한다", async () => {
        const command: CreateSellerCommand = {
            email: "seller@test.com",
            username: "seller",
            password: undefined,
        };

        // Act
        const response = await request(app.getHttpServer())
            .post("/seller/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it.each([
        "",
        "pass",
        "pass123",
    ])("password 속성이 올바른 형식을 따르지 않으면 400 Bad Request 상태코드를 반환한다", async (password: string) => {
        const command: CreateSellerCommand = {
            email: "seller@test.com",
            username: "seller",
            password,
        };

        // Act
        const response = await request(app.getHttpServer())
            .post("/seller/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it("email 속성에 이미 존재하는 이메일 주소가 지정되면 400 Bad Request 상태코드를 반환한다", async () => {
        // Arrange
        const email = "seller@test.com";
        await request(app.getHttpServer())
            .post("/seller/signUp")
            .send({
                email,
                username: "seller",
                password: "password",
            });

        // Act
        const response = await request(app.getHttpServer())
            .post("/seller/signUp")
            .send({
                email,
                username: "seller",
                password: "password",
            });

        // Assert
        expect(response.statusCode).toBe(400);
    });
});
