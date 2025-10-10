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

@Controller("shopper")
export class ShopperIssueTokenController {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Shopper)
        private readonly repository: Repository<Shopper>,
    ) {
    }

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
            accessToken: this.composeToken(),
        };

        return res.status(HttpStatus.OK).send(token);
    }

    private composeToken() {
        return this.jwtService.sign(``);
    }
}
