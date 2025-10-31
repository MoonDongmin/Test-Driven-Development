export class RegisterProductCommand {
  name: string;

  imageUri: string;

  description: string;

  priceAmount: bigint;

  stockQuantity: number;

  constructor(name: string, imageUri: string, description: string, priceAmount: bigint, stockQuantity: number) {
    this.name = name;
    this.imageUri = imageUri;
    this.description = description;
    this.priceAmount = priceAmount;
    this.stockQuantity = stockQuantity;
  }
}
