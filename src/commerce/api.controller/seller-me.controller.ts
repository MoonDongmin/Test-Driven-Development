import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
}                         from "@nestjs/common";
import {SellerMeView}     from "@/commerce/view/seller-me-view";
import {Repository}       from "typeorm";
import {Seller}           from "@/commerce/seller";
import {InjectRepository} from "@nestjs/typeorm";

@Controller()
export class SellerMeController {
    constructor(
        @InjectRepository(Seller)
        private readonly sellerRepository: Repository<Seller>,
    ) {
    }

    @Get("seller/me")
    async me(@Req() req: any): Promise<SellerMeView> {
        if (!req.user) {
            throw new UnauthorizedException();
        }

        const seller: Seller | null = await this.sellerRepository.findOneBy({
            id: req.user.sub,
        });

        return new SellerMeView(req.user.sub, seller!.email, seller!.username);
    }
}
