import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
}                         from "@nestjs/common";
import {Repository}       from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {ShoppeMeView}     from "@/commerce/view/shoppe-me-view";
import {Shopper}          from "@/commerce/shopper";

@Controller("shopper")
export class ShopperMeController {
  constructor(
    @InjectRepository(Shopper)
    private readonly shopperRepository: Repository<Shopper>,
  ) {
  }

  @Get("me")
  async me(@Req() req: any) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const shopper = await this.shopperRepository.findOneBy(({
      id: req.user.sub,
    }));

    return new ShoppeMeView(req.user.sub, shopper!.email, shopper!.username);
  }
}
