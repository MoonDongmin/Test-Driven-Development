export class PageCarrier<T> {
  items: T[];
  continuationToken: string | undefined;

  constructor(items: T[], continuationToken: string | undefined) {
    this.items = items;
    this.continuationToken = continuationToken;
  }
}
