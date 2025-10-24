import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
}                                 from "@nestjs/common";
import type {Response}            from "express";
import type {CreateSellerCommand} from "@/commerce/command/create-seller-command";
import {InjectRepository}         from "@nestjs/typeorm";
import {Seller}                   from "@/seller";
import {Repository}               from "typeorm";
import {
  isEmailValid,
  isPasswordValid,
  isUsernameValid,
}                                 from "@/commerce/user-property-validator";
import {
  randomUUID,
  UUID,
}                                 from "node:crypto";
import {Public}                   from "@/commerce/api.controller/auth.guard";

@Controller("seller")
export class SellerSignUpController {
    constructor(
        @InjectRepository(Seller)
        private readonly sellerRepository: Repository<Seller>,
    ) {
    }

    @Public()
    @Post("/signUp")
    async singUp(@Res() res: Response, @Body() command: CreateSellerCommand) {
        if (this.isCommandValid(command) === false) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        const hashedPassword: string = await Bun.password.hash(command.password!, {
            algorithm: "bcrypt",
        });

        try {
            const id: UUID = randomUUID();

            await this.sellerRepository.save({
                id,
                email: command.email,
                username: command.username,
                password: hashedPassword,
            });
        } catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        return res.status(HttpStatus.NO_CONTENT).send();
    }

    private isCommandValid(command: CreateSellerCommand): boolean {
        return isEmailValid(command.email)
            && isUsernameValid(command.username)
            && isPasswordValid(command.password);
    }

}
