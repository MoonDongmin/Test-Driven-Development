export class Consumer<T> {
  constructor(
    private readonly func: (value: T) => void,
  ) {
  }

  async accept(value: T): Promise<void> {
    await this.func(value);
  }
}

export type Optional<T> = T | null | undefined;

export class Function<T, R> {
  constructor(private readonly func: (dto: T) => Promise<R>) {
  }

  async apply(dto: T): Promise<R> {
    return await this.func(dto);
  }
};
