import {RegisterProductCommand} from "@/commerce/command/register-product-command";
import {randomUUID}             from "node:crypto";

export class RegisterProductCommandGenerator {

  public static generateRegisterProductCommand(): RegisterProductCommand {
    return new RegisterProductCommand(
      this.generateProductName(),
      this.generateProductImageUri(),
      this.generateProductDescription(),
      this.generateProductPriceAmount(),
      this.generateProductStockQuantity(),
    );
  }


  public static generateRegisterProductCommandWithOutImageUri(imageUri: string) {
    return new RegisterProductCommand(
      this.generateProductName(),
      imageUri,
      this.generateProductDescription(),
      this.generateProductPriceAmount(),
      this.generateProductStockQuantity(),
    );
  }


  private static generateProductStockQuantity(): number {
    const min = 10;
    const max = 100;

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static generateProductPriceAmount(): number {
    const min = 10000;
    const max = 1000000;

    const randomValue: number = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomValue;
  }

  private static generateProductDescription(): string {
    return "description" + randomUUID();
  }

  private static generateProductImageUri(): string {
    return "https://test.com/images/" + randomUUID();
  }

  private static generateProductName(): string {
    return "name" + randomUUID();
  }
}
