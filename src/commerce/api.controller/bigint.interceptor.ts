import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import {
  map,
  Observable,
} from "rxjs";

@Injectable()
export class BigintInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    // 요청 body에서 string을 bigint로 변환
    const request = context.switchToHttp().getRequest();
    if (request.body) {
      this.convertStringToBigInt(request.body, ['priceAmount']);
    }

    // 응답에서 bigint를 string으로 변환
    return next
      .handle()
      .pipe(map((data) => this.convertBigIntToString(data)));
  }

  private convertStringToBigInt(data: any, fields: string[]): void {
    if (data !== null && typeof data === "object") {
      fields.forEach((field) => {
        if (data[field] !== undefined && data[field] !== null) {
          data[field] = BigInt(data[field]);
        }
      });
    }
  }

  private convertBigIntToString(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.convertBigIntToString(item));
    } else if (data !== null && typeof data === "object") {

      Object.keys(data).forEach((key) => {
        if (typeof data[key] === "bigint") {
          data[key] = data[key].toString();
        } else if (typeof data[key] === "object") {
          this.convertBigIntToString(data[key]);
        }
      });
    }
    return data;
  }
}
