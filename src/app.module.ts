import {Module}                     from "@nestjs/common";
import {AppController}              from "@/app.controller";
import {AppService}                 from "@/app.service";
import {SellerSignUpController}     from "@/commerce/api.controller/seller-signUp.controller";
import {TypeOrmModule}              from "@nestjs/typeorm";
import {Seller}                     from "@/seller";
import * as process                 from "node:process";
import {ConfigModule}               from "@nestjs/config";
import {SellerIssueTokenController} from "@/commerce/api.controller/seller-issueToken.controller";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forFeature([Seller]),
        TypeOrmModule.forRoot({
            type: "postgres",
            url: process.env.TEST_DB_URL,
            ssl: true,
            synchronize: true,
            dropSchema: true,
            entities: [Seller],
        }),
    ],
    controllers: [AppController, SellerSignUpController, SellerIssueTokenController],
    providers: [AppService],
})
export class AppModule {
}
