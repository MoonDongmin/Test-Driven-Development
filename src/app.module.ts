import {Module}                 from "@nestjs/common";
import {AppController}          from "@/app.controller";
import {AppService}             from "@/app.service";
import {SellerSignUpController} from "@/commerce/api.controller/seller-signUp.controller";

@Module({
    imports: [],
    controllers: [AppController, SellerSignUpController],
    providers: [AppService],
})
export class AppModule {
}
