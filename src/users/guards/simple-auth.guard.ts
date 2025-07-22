import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

// TODO: Заменить на passport jwt guard
@Injectable()
export class SimpleAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [tokenType, token] = authHeader.split(' ');
    if (tokenType != 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    if (!token.trim()) {
      throw new UnauthorizedException('Token is empty');
    }

    req.userToken = token;
    return true;
  }
}
