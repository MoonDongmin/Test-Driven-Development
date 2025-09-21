import {v4 as uuid} from "uuid";

export class PasswordGenerator {
    public static generatePassword(): string {
        return "password" + uuid();
    }
}
