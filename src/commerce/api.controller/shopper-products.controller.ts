import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
}                         from "@nestjs/common";
import {
  Repository,
  SelectQueryBuilder,
}                         from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
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
  async getProducts(
    @Res() res,
    @Query("continuationToken") continuationToken?: string,
  ) {
    const pageSize = 4;

    const cursor: number | null = continuationToken
      ? this.decodeCursor(continuationToken) : null;

    const qb: SelectQueryBuilder<Product> = this.productRepository
      .createQueryBuilder("p")
      .innerJoinAndSelect(Seller, "s", "p.sellerId = s.id");

    if (cursor !== null) {
      qb.where("p.dataKey <= :cursor", {cursor});
    }

    const results = await qb
      .orderBy("p.dataKey", "DESC")
      .take(pageSize + 1)
      .getRawMany();

    if (results.length === 0) {
      return res.status(HttpStatus.OK).send();
    }

    const items = results
      .slice(0, pageSize)
      .map(row => {
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

    const next = results.length >= pageSize
      ? results[pageSize]?.p_dataKey
      : undefined;

    const carrier = new PageCarrier(items, this.encodeCursor(next));

    return res.status(HttpStatus.OK).json(carrier);
  }

  private encodeCursor(cursor: number): string | undefined {
    if (cursor === undefined) {
      return undefined;
    }
    return Buffer.from(cursor.toString()).toString("base64");
  }

  private decodeCursor(continuationToken: string): number {
    return parseInt(Buffer.from(continuationToken, "base64").toString("utf-8"));
  }
}
