export class FindSellerProduct {
  _sellerId: string;
  _productId: string;

  constructor(sellerId: string, productId: string) {
    this._sellerId = sellerId;
    this._productId = productId;
  }


  getSellerId(): string {
    return this._sellerId;
  }

  getProductId(): string {
    return this._productId;
  }
}
