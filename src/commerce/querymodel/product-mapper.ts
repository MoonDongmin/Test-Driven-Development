import {Product}           from "@/commerce/product";
import {SellerProductView} from "@/commerce/view/seller-product-view";

export class ProductMapper {

  public static convertToView(product: Product) {
    return new SellerProductView(
      product.id,
      product.name,
      product.imageUri,
      product.description,
      product.priceAmount.toString(),
      product.stockQuantity,
      product.registeredTimeUtc,
    );
  }
}
