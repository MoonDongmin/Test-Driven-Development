import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
}                               from "@nestjs/common";
import {Repository}             from "typeorm";
import {Seller}                 from "@/commerce/seller";
import {InjectRepository}       from "@nestjs/typeorm";
import {RegisterProductCommand} from "@/commerce/command/register-product-command";
import {
  randomUUID,
  UUID,
}                               from "node:crypto";
import {Product}                from "@/commerce/product";
import {SellerProductView}      from "@/commerce/view/seller-product-view";

@Controller("seller")
export class SellerProductsController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
  }

  @Post("/products")
  async registerProduct(@Req() req: any, @Res() res: any, @Body() command: RegisterProductCommand) {
    if (this.isValidUri(command.imageUri) === false) {
      throw new BadRequestException();
    }

    const id: UUID = randomUUID();

    const product = new Product();
    product.id = id;
    product.sellerId = req.user.sub;
    product.name = command.name;
    product.imageUri = command.imageUri;
    product.description = command.description;
    product.priceAmount = BigInt(command.priceAmount);
    product.stockQuantity = command.stockQuantity;

    await this.productRepository.save(product);

    const location = `/seller/products/${id}`;

    return res.setHeader("location", location).status(201).send();
  }

  private isValidUri(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  }

  @Get("/products/:id")
  async findProduct(@Req() req, @Res() res: any, @Param("id") id: string) {
    const product: Product | null = await this.productRepository.findOne({
      where: {
        id,
        sellerId: req.user.sub,
      },
    });

    if (!product) {
      throw new NotFoundException();
    }

    const sellerProductView = new SellerProductView(
      product.id,
      product.name,
      product.imageUri,
      product.description,
      product.priceAmount.toString(),
      product.stockQuantity,
      null,
    );

    return res.status(HttpStatus.OK).send(sellerProductView);
  }
}
