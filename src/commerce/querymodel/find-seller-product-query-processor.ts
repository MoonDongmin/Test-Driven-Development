import {FindSellerProduct} from "@/commerce/query/find-seller-product";
import {Product}           from "@/commerce/product";
import {Optional}          from "@/common/types";
import {Function}          from "@/common/types";

export class FindSellerProductQueryProcessor {
  public findProduct: Function<FindSellerProduct, Optional<Product>>;

  constructor(findProduct: Function<FindSellerProduct, Optional<Product>>) {
    this.findProduct = findProduct;
  }

  async apply(query: FindSellerProduct): Promise<Optional<Product>> {
    return await this.findProduct.apply(query);
  }
}
