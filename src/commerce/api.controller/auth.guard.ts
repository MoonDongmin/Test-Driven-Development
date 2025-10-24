import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
}                   from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import type {Request}    from "express";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: any = context.switchToHttp().getRequest();

        const token: string | undefined = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            request.user = this.getUserFromToken(token);
        } catch {
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
