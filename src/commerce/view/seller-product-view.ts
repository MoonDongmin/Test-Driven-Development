export class SellerProductView {
  id: string;
  name: string | null;
  imageUri: string | null;
  description: string | null;
  priceAmount: string | null;
  stockQuantity: number | null;
  registeredTimeUtc: Date;


  constructor(id: string, name: string | null, imageUri: string | null, description: string | null, priceAmount: string | null, stockQuantity: number | null, registeredTimeUtc: Date) {
    this.id = id;
    this.name = name;
    this.imageUri = imageUri;
    this.description = description;
    this.priceAmount = priceAmount;
    this.stockQuantity = stockQuantity;
    this.registeredTimeUtc = registeredTimeUtc;
  }
}
