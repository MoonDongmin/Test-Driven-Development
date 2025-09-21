import {v4 as uuid} from "uuid";

export class UsernameGenerator {
    public static generateUsername(): string {
        return "username" + uuid();
    }
}
