import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
}                     from "@nestjs/common";
import {JwtService}   from "@nestjs/jwt";
import type {Request} from "express";
import {Reflector}    from "@nestjs/core";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request: any = context.switchToHttp().getRequest() as Request & {
      user?: { user?: { sub: string, scp: string } }
    };

    const token: string | undefined = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const user = this.getUserFromToken(token);
      request.user = user;

      const controller = Reflect.getMetadata("path", context.getClass());

      if (controller === "seller") {
        if (user.scp !== "seller") {
          throw new ForbiddenException();
        }
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException();
      }

      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private getUserFromToken(token: string) {
    return this.jwtService.verify(token);
  }
}
