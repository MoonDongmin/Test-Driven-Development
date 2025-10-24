import request                 from "supertest";
import type {INestApplication} from "@nestjs/common";
import {UsernameGenerator}     from "../../../username-generator";
import {EmailGenerator}        from "../../../email-generator";
import {PasswordGenerator}     from "../../../password-generator";
import {
  Test,
  TestingModule,
}                              from "@nestjs/testing";
import {AppModule}             from "@/app.module";
import {CreateShopperCommand}  from "@/commerce/command/create-shopper-command";
import {CreateSellerCommand}   from "@/commerce/command/create-seller-command";
import {TestDataSource}        from "../../../test-data-source";
import {Repository}            from "typeorm";
import {Shopper}               from "@/commerce/shopper";
import {getRepositoryToken}    from "@nestjs/typeorm";

describe("/shopper/signup", () => {
    let app: INestApplication;
    let shopperRepository: Repository<Shopper>;


    const {generateUsername} = UsernameGenerator;
    const {generateEmail} = EmailGenerator;
    const {generatePassword} = PasswordGenerator;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        shopperRepository = moduleFixture.get(getRepositoryToken(Shopper));

        await app.init();
    });

    it("올바르게 요청하면 204 No Content 상태코드를 반환한다", async () => {
        // Arrange
        const command: CreateSellerCommand = new CreateShopperCommand(
            generateEmail(),
            generateUsername(),
            generatePassword(),
        );

        // Act
        const response = await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(204);
    });

    it("email 속성이 지정되지 않으면 400 Bad Request 상태코드를 반환한다", async () => {
        // Arrange
        const command: CreateSellerCommand = new CreateShopperCommand(
            undefined,
            generateUsername(),
            generatePassword(),
        );

        // Act
        const response = await request(app.getHttpServer())
            .post("/shopper/signUp")
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
        const command: CreateSellerCommand = new CreateShopperCommand(
            email,
            generateUsername(),
            generatePassword(),
        );

        // Act
        const response = await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it("username 속성이 지정되지 않으면 400 Bad Request 상태코드를 반환한다", async () => {
        // Arrange
        const command: CreateSellerCommand = new CreateShopperCommand(
            generateEmail(),
            undefined,
            generatePassword(),
        );

        // Act
        const response = await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it.each([
        "",
        "sh",
        "shopper ",
        "shopper.",
        "shopper!",
        "shopper@",
    ])("username 속성이 올바른 형식을 따르지 않으면 400 Bad Request 상태코드를 반환한다", async (username: string) => {
        // Arrange
        const command: CreateSellerCommand = new CreateShopperCommand(
            generateEmail(),
            username,
            generatePassword(),
        );

        // Act
        const response = await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it.each([
        "abcdeefghijklmnopqrstuvwxyz",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "0123456789",
        "shopper-",
        "shopper_",
    ])("username 속성이 올바른 형식을 따르면 204 No Content 상태코드를 반환한다", async (username: string) => {
        // Arrange
        const command: CreateShopperCommand = new CreateShopperCommand(
            generateEmail(),
            username,
            generatePassword(),
        );

        // Act
        const response = await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(204);
    });

    it("password 속성이 지정되지 않으면 400 Bad Request 상태코드를 반환한다", async () => {
        // Arrange
        const command: CreateShopperCommand = new CreateShopperCommand(
            generateEmail(),
            generateUsername(),
            undefined,
        );

        // Act
        const response = await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it.each(TestDataSource.invalidPasswords())("password 속성이 올바른 형식을 따르지 않으면 400 Bad Request 상태코드를 반환한다", async (password: string) => {
        // Arrange
        const command: CreateShopperCommand = new CreateShopperCommand(
            generateEmail(),
            generateUsername(),
            password,
        );

        // Act
        const response = await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(command);

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it("email 속성에 이미 존재하는 이메일 주소가 지정되면 400 Bad Request 상태코드를 반환한다", async () => {
        // Arrange
        const email: string = generateEmail();

        await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(new CreateShopperCommand(
                email,
                generateUsername(),
                generatePassword(),
            ));

        // Act
        const response = await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(new CreateShopperCommand(
                email,
                generateUsername(),
                generatePassword(),
            ));

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it("username 속성이 이미 존재하는 사용자이름이 지정되면 400 Bad Request 상태코드를 반환한다", async () => {
        // Arrange
        const username: string = generateUsername();

        await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(new CreateShopperCommand(
                generateEmail(),
                username,
                generatePassword(),
            ));

        // Act
        const response = await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(new CreateShopperCommand(
                generateEmail(),
                username,
                generatePassword(),
            ));

        // Assert
        expect(response.statusCode).toBe(400);
    });

    it("비밀번호를 올바르게 암호화한다", async () => {
        // Arrange
        const command: CreateSellerCommand = new CreateShopperCommand(
            generateEmail(),
            generateUsername(),
            generatePassword(),
        );

        // Act
        await request(app.getHttpServer())
            .post("/shopper/signUp")
            .send(command);

        // Assert
        const shopper: Shopper | null = await shopperRepository.findOneBy({email: command.email!});
        const isMatch: boolean = await Bun.password.verify(command.password!, shopper?.hashedPassword!);
        expect(isMatch).toBe(true);
    });



});
