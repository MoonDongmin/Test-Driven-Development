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

const EMAIL_REGEX: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX: RegExp = /^[a-zA-Z0-9_-]{3,}$/;

@Controller("seller")
export class SellerSignUpController {
    constructor(
        @InjectRepository(Seller)
        private readonly sellerRepository: Repository<Seller>,
    ) {
    }

    @Post("/signUp")
    async singUp(@Res() res: Response, @Body() command: CreateSellerCommand) {
        if (this.isCommandValid(command) === false) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        try {
            await this.sellerRepository.save({
                email: command.email,
            });
        } catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        return res.status(HttpStatus.NO_CONTENT).send();
    }

    private isCommandValid(command: CreateSellerCommand): boolean {
        return this.isEmailValid(command.email)
            && this.isUsernameValid(command.username)
            && this.isPasswordValid(command.password);
    }

    private isUsernameValid(username: string | undefined): boolean {
        return username !== undefined && USERNAME_REGEX.test(username);
    }

    private isEmailValid(email: string | undefined): boolean {
        return email !== undefined && EMAIL_REGEX.test(email);
    }

    private isPasswordValid(password: string | undefined): boolean {
        return password !== undefined && password.length >= 8;
    }
}
