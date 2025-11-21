import {SellerView} from "@/commerce/view/seller-view";

export class ProductView {
  id: string;
  seller: SellerView | null;
  name: string | null;
  imageUri: string | null;
  description: string | null;
  priceAmount: string | null;
  stockQuantity: number | null;


  constructor(id: string, seller: SellerView | null, name: string | null, imageUri: string | null, description: string | null, priceAmount: string | null, stockQuantity: number | null) {
    this.id = id;
    this.seller = seller;
    this.name = name;
    this.imageUri = imageUri;
    this.description = description;
    this.priceAmount = priceAmount;
    this.stockQuantity = stockQuantity;
  }
}
