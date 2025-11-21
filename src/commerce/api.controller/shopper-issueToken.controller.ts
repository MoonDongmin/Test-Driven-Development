import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
}                               from "@nestjs/common";
import type {Response}          from "express";
import {AccessTokenCarrier}     from "@/commerce/result/access-token-carrier";
import {JwtService}             from "@nestjs/jwt";
import {InjectRepository}       from "@nestjs/typeorm";
import {Repository}             from "typeorm";
import {Shopper}                from "@/commerce/shopper";
import type {IssueShopperToken} from "@/commerce/query/issue-shopper-token";
import {Public}                 from "@/commerce/api.controller/auth.guard";

@Controller("shopper")
export class ShopperIssueTokenController {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Shopper)
    private readonly repository: Repository<Shopper>,
  ) {
  }

  @Public()
  @Post("issueToken")
  async issueToken(@Res() res: Response, @Body() query: IssueShopperToken) {
    const result: Shopper | null = await this.repository.findOneBy({
      email: query.email,
    });

    if (!result) {
      throw new BadRequestException();
    }

    const passwordVerify: boolean = await Bun.password.verify(query.password, result.hashedPassword);
    if (!passwordVerify) {
      throw new BadRequestException();
    }

    const token: AccessTokenCarrier = {
      accessToken: this.composeToken(result),
    };

    return res.status(HttpStatus.OK).send(token);
  }

  private composeToken(shopper: Shopper) {
    return this.jwtService.sign({
      sub: shopper.id,
      scp: "shopper",
    });
  }
}
