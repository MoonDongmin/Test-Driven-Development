export class PageCarrier<T> {
  items: T[];
  continuationToken: string | null;

  constructor(items: T[], continuationToken: string | null) {
    this.items = items;
    this.continuationToken = continuationToken;
  }
}
