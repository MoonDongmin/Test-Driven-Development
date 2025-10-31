import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  Res,
}                               from "@nestjs/common";
import {Repository}             from "typeorm";
import {Seller}                 from "@/seller";
import {InjectRepository}       from "@nestjs/typeorm";
import {RegisterProductCommand} from "@/commerce/command/register-product-command";
import {randomUUID}             from "node:crypto";

@Controller()
export class SellerProductsController {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {
  }

  @Post("seller/products")
  // @UseInterceptors(BigintInterceptor)
  async registerProduct(@Req() req: any, @Res() res: any, @Body() command: RegisterProductCommand) {
    const seller: Seller | null = await this.sellerRepository.findOneBy({
      id: req.user.sub,
    });

    if (!seller) {
      throw new ForbiddenException();
    } else if (this.isValidUri(command.imageUri) === false) {
      throw new BadRequestException();
    }

    const location = `/seller/products/${randomUUID()}`;

    return res.setHeader('location', location).status(201).send();
  }

  private isValidUri(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  }
}
