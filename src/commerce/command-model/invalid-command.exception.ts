import {
  HttpException,
  HttpStatus,
} from "@nestjs/common";

export class InvalidCommandException extends HttpException {
  constructor() {
    super("BadRequest", HttpStatus.BAD_REQUEST);
  }
}
