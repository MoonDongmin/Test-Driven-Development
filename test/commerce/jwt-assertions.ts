export function conformsToJwtFormat(actual: string) {
    return () => {
        const parts: string[] = actual.split("\\.");
        parts.forEach((part: string) => isBase64UrlEncoded(part));
    };
}

function isBase64UrlEncoded(part: string) {
    return Buffer.from(part, "base64").toString("base64");
}
