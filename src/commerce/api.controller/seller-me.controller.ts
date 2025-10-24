import {
    Controller,
    Get,
    Req,
    UnauthorizedException,
    UseGuards,
}                     from "@nestjs/common";
import {AuthGuard}    from "@/commerce/api.controller/auth.guard";
import {SellerMeView} from "@/commerce/view/seller-me-view";
import {Repository}   from "typeorm";
import {Seller}       from "@/seller";
import {InjectRepository} from "@nestjs/typeorm";

@Controller()
export class SellerMeController {
    constructor(
        @InjectRepository(Seller)
        private readonly sellerRepository: Repository<Seller>,
    ) {
    }

    @Get("seller/me")
    @UseGuards(AuthGuard)
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
