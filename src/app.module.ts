import {Module}                 from "@nestjs/common";
import {AppController}          from "@/app.controller";
import {AppService}             from "@/app.service";
import {SellerSignUpController} from "@/commerce/api.controller/seller-signUp.controller";
import {TypeOrmModule}          from "@nestjs/typeorm";
import {Seller}                 from "@/seller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Seller]),
        TypeOrmModule.forRoot({
            type: "postgres",
            url: "postgresql://neondb_owner:npg_fYw8CNW4tXmU@ep-lucky-mountain-a1j4ou53-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
            ssl: true,
            synchronize: true,
            entities: [Seller],
        }),
    ],
    controllers: [AppController, SellerSignUpController],
    providers: [AppService],
})
export class AppModule {
}
