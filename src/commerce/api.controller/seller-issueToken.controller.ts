import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
}                              from "@nestjs/common";
import type {Response}         from "express";
import {AccessTokenCarrier}    from "@/commerce/result/access-token-carrier";
import {JwtService}            from "@nestjs/jwt";
import {InjectRepository}      from "@nestjs/typeorm";
import {Seller}                from "@/seller";
import {Repository}            from "typeorm";
import type {IssueSellerToken} from "@/commerce/query/issue-seller-token";
import {Public}                from "@/commerce/api.controller/auth.guard";

@Controller("seller")
export class SellerIssueTokenController {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Seller)
        private readonly repository: Repository<Seller>,
    ) {
    }

  @Public()
  @Post("issueToken")
    async issueToken(@Res() res: Response, @Body() query: IssueSellerToken) {
        const result: Seller | null = await this.repository.findOneBy({
            email: query.email,
        });

        if (!result) {
            throw new BadRequestException();
        }

        const passwordVerify: boolean = await Bun.password.verify(query.password, result.password);
        if (!passwordVerify) {
            throw new BadRequestException();
        }

        const token: AccessTokenCarrier = {
            accessToken: this.composeToken(result),
        };

        return res.status(HttpStatus.OK).send(token);
    }

    private composeToken(seller: Seller) {
        return this.jwtService.sign({sub: seller.id});
    }
}
