import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

// TODO: Switch to passport jwt guard
@Injectable()
export class LeaderRefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const refreshToken = req.cookies?.leaderIdRefreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Leader ID refreshToken is missing');
    }

    return true;
  }
}