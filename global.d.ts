declare module "bun:test" {
    interface Matchers<T> {
        toBeValidBase64UrlJson(): T;
    }
}
