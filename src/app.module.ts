import {Module}                      from "@nestjs/common";
import {AppController}               from "@/app.controller";
import {AppService}                  from "@/app.service";
import {SellerSignUpController}      from "@/commerce/api.controller/seller-signUp.controller";
import {TypeOrmModule}               from "@nestjs/typeorm";
import {Seller}                      from "@/seller";
import {ConfigModule}                from "@nestjs/config";
import {SellerIssueTokenController}  from "@/commerce/api.controller/seller-issueToken.controller";
import {JwtModule}                   from "@nestjs/jwt";
import {ShopperSignUpController}     from "@/commerce/api.controller/shopper-signUp.controller";
import {Shopper}                     from "@/commerce/shopper";
import {ShopperIssueTokenController} from "@/commerce/api.controller/shopper-issueToken.controller";

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: process.env.SECRET,
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forFeature([Seller, Shopper]),
        TypeOrmModule.forRoot({
            type: "postgres",
            url: process.env.TEST_DB_URL,
            ssl: true,
            synchronize: true,
            dropSchema: true,
            entities: [Seller, Shopper],
        }),
    ],
    controllers: [AppController, SellerSignUpController, SellerIssueTokenController, ShopperSignUpController, ShopperIssueTokenController],
    providers: [AppService],
})
export class AppModule {
}
