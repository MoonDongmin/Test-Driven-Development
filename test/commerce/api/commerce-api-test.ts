// import type {INestApplication} from "@nestjs/common";
// import {UsernameGenerator}     from "../username-generator";
// import {EmailGenerator}        from "../email-generator";
// import {PasswordGenerator}     from "../password-generator";
// import {
//     Test,
//     TestingModule,
// }                              from "@nestjs/testing";
// import {AppModule}             from "@/app.module";
//
// export function CommerceApiTest() {
//     let app: INestApplication;
//
//     const {generateUsername} = UsernameGenerator;
//     const {generateEmail} = EmailGenerator;
//     const {generatePassword} = PasswordGenerator;
//
//     beforeAll(async () => {
//         const moduleFixture: TestingModule = await Test.createTestingModule({
//             imports: [AppModule],
//         }).compile();
//
//         app = moduleFixture.createNestApplication();
//         await app.init();
//     });
//     return {
//         app,
//         generateUsername,
//         generateEmail,
//         generatePassword,
//     };
// }
