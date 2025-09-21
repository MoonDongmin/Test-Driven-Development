import {
    Controller,
    HttpStatus,
    Post,
    Res,
}                      from "@nestjs/common";
import type {Response} from "express";

@Controller("seller")
export class SellerIssueTokenController {

    @Post("issueToken")
    issueToken(@Res() res: Response) {
        return res.status(HttpStatus.OK).send();
    }
}
