export class SellerProductView {
  id: string;
  name: string | null;
  imageUri: string | null;
  description: string | null;
  priceAmount: number | null;
  stockQuantity: number | null;
  registeredTimeUtc: string | null;


  constructor(id: string, name: string | null, imageUri: string | null, description: string | null, priceAmount: number | null, stockQuantity: number | null, registeredTimeUtc: string | null) {
    this.id = id;
    this.name = name;
    this.imageUri = imageUri;
    this.description = description;
    this.priceAmount = priceAmount;
    this.stockQuantity = stockQuantity;
    this.registeredTimeUtc = registeredTimeUtc;
  }
}
