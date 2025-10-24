import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
}                                  from "@nestjs/common";
import type {Response}             from "express";
import type {CreateShopperCommand} from "@/commerce/command/create-shopper-command";
import {
  isEmailValid,
  isPasswordValid,
  isUsernameValid,
}                                  from "@/commerce/user-property-validator";
import {InjectRepository}          from "@nestjs/typeorm";
import {Repository}                from "typeorm";
import {Shopper}                   from "@/commerce/shopper";
import {Public}                    from "@/commerce/api.controller/auth.guard";
import {
  randomUUID,
  UUID,
}                                  from "node:crypto";

@Controller("shopper")
export class ShopperSignUpController {
  constructor(
    @InjectRepository(Shopper)
    private readonly shopperRepository: Repository<Shopper>,
  ) {
  }

  @Public()
  @Post("/signUp")
  async singUp(@Res() res: Response, @Body() command: CreateShopperCommand) {
    if (this.isCommandValid(command) === false) {
      throw new BadRequestException();
    }
    const id: UUID = randomUUID();

    const shopper: Shopper = new Shopper();
    shopper.id = id;
    shopper.email = command.email!;
    shopper.username = command.username!;
    shopper.hashedPassword = await Bun.password!.hash(command.password!, {
      algorithm: "bcrypt",
    });

    try {
      await this.shopperRepository.save(shopper);
    } catch (e) {
      throw new BadRequestException(e);
    }

    return res.status(HttpStatus.NO_CONTENT).send();
  }

  private isCommandValid(command: CreateShopperCommand): boolean {
    return isEmailValid(command.email)
      && isUsernameValid(command.username)
      && isPasswordValid(command.password);
  }
}
