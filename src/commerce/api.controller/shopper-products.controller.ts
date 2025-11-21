import {
  Controller,
  Get,
  HttpStatus,
  Req,
  UnauthorizedException,
}                         from "@nestjs/common";
import {Repository}       from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {ShoppeMeView}     from "@/commerce/view/shoppe-me-view";
import {Shopper}          from "@/commerce/shopper";
import {Product}          from "@/commerce/product";
import {ProductView}      from "@/commerce/view/product-view";
import {PageCarrier}      from "@/commerce/result/page-carrier";
import {Seller}           from "@/commerce/seller";
import {SellerView}       from "@/commerce/view/seller-view";

@Controller("shopper")
export class ShopperProductsController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {
  }

  @Get("/products")
  async getProducts(@Req() req: any) {
    // let items: Product[] = await this.productRepository.createQueryBuilder('products')

    // SELECT new commerce.api.controller.ProducSellerTuple(p, s)
    // From Product P
    // Join Seller s On p.sellerId = s.id
    // orderBy p.dataKey DESC

    const results = await this.productRepository
      .createQueryBuilder("p")
      .innerJoinAndSelect(Seller, "s", "p.sellerId = s.id")
      .orderBy("p.dataKey", "DESC")
      .getRawMany();

    const items = results.map(row => {
      const sellerView = new SellerView(row.s_id, row.s_username);
      return new ProductView(
        row.p_id,
        sellerView,
        row.p_name,
        row.p_imageUri,
        row.p_description,
        row.p_priceAmount,
        row.p_stockQuantity,
      );
    });

    // items
    //   .sort((a, b) => b.dataKey - a.dataKey)
    //   .map(product => {
    //       return new ProductView(
    //         product.id,
    //         null,
    //         product.name,
    //         product.imageUri,
    //         product.description,
    //         product.priceAmount.toString(),
    //         product.stockQuantity);
    //     },
    //   );

    return new PageCarrier(items, null);
  }
}
