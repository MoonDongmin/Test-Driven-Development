import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
}                                        from "@nestjs/common";
import {Repository}                      from "typeorm";
import {InjectRepository}                from "@nestjs/typeorm";
import {RegisterProductCommand}          from "@/commerce/command/register-product-command";
import {
  randomUUID,
  UUID,
}                                        from "node:crypto";
import {Product}                         from "@/commerce/product";
import {RegisterProductCommandExecutor}  from "@/commerce/command-model/register-product-command-executor";
import {
  Consumer,
  Optional,
}                                        from "@/common/types";
import {ProductMapper}                   from "@/commerce/querymodel/product-mapper";
import {FindSellerProductQueryProcessor} from "@/commerce/querymodel/find-seller-product-query-processor";
import {FindSellerProduct}               from "@/commerce/query/find-seller-product";
import {Function}                        from "@/common/types";

@Controller("seller")
export class SellerProductsController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
  }

  @Post("/products")
  async registerProduct(@Req() req: any, @Res() res: any, @Body() command: RegisterProductCommand) {
    const id: UUID = randomUUID();
    const saveProduct = new Consumer<Product>(
      async (product) => await this.productRepository.save(product),
    );

    const executor = new RegisterProductCommandExecutor(saveProduct);
    await executor.execute(command, id, req.user.sub);

    const location = `/seller/products/${id}`;
    return res.setHeader("location", location).status(201).send();
  }

  @Get("/products/:id")
  async findProduct(@Req() req, @Res() res: any, @Param("id") id: string) {
    const sellerId = req.user.sub;

    const findProduct = new Function<FindSellerProduct, Optional<Product>>(
      async (query: FindSellerProduct) => (await this.productRepository.findOneBy(
        {
          id: query.getProductId(),
          sellerId: query.getSellerId(),
        },
      )) as Optional<Product>,
    );

    const processor = new FindSellerProductQueryProcessor(findProduct);
    const query = new FindSellerProduct(sellerId, id);
    await this.process(processor, query)
      .then(
        (productView) => res.status(HttpStatus.OK).send(productView),
      )
      .catch(
        () => res.status(HttpStatus.NOT_FOUND).send(),
      );
  }

  private async process(processor: FindSellerProductQueryProcessor, query: FindSellerProduct) {
    const product = await processor.apply(new FindSellerProduct(query.getSellerId(), query.getProductId()));

    if (!product) {
      throw new NotFoundException();
    }

    return ProductMapper.convertToView(product);
  }

  @Get("products")
  async getProducts(@Req() req: any) {
    const items: Product[] = await this.productRepository.find({
      where: {
        sellerId: req.user.sub,
      },
    });

    return items
      .map(product => ProductMapper.convertToView(product))
      .sort((a, b) => b.registeredTimeUtc.getTime() - a.registeredTimeUtc.getTime());
  }
}
