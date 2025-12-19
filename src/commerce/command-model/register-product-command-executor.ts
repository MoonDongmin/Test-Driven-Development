import {Product}                 from "@/commerce/product";
import {RegisterProductCommand}  from "@/commerce/command/register-product-command";
import {InvalidCommandException} from "@/commerce/command-model/invalid-command.exception";
import {UUID}                    from "node:crypto";
import type {Consumer}           from "@/common/types";

export class RegisterProductCommandExecutor {
  constructor(
    private saveProduct: Consumer<Product>,
  ) {
  }

  public async execute(command: RegisterProductCommand, id: UUID, sellerId) {
    this.validateCommand(command);
    const product = this.createProduct(id, sellerId, command);
     await this.saveProduct.accept(product);
  }

  private validateCommand(command: RegisterProductCommand) {
    if (RegisterProductCommandExecutor.isValidUri(command.imageUri) === false) {
      throw new InvalidCommandException();
    }
  }

  private createProduct(id: UUID, sellerId, command: RegisterProductCommand) {
    const product = new Product();
    product.id = id;
    product.sellerId = sellerId;
    product.name = command.name;
    product.imageUri = command.imageUri;
    product.description = command.description;
    product.priceAmount = BigInt(command.priceAmount);
    product.stockQuantity = command.stockQuantity;
    product.registeredTimeUtc = new Date(Date.now());
    return product;
  }

  public static isValidUri(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  }
}
