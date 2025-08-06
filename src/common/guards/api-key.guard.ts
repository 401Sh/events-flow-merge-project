import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  // private readonly validApiKeys: Set<string>;
  private readonly validApiKey: string;

  constructor(private configService: ConfigService) {
    // const keys = this.configService.getOrThrow('API_KEYS');
    // this.validApiKeys = new Set(keys.split(',').map(v => v.trim()));
    this.validApiKey = this.configService.getOrThrow('API_KEY');
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['x-api-key'];

    // if (!apiKey || !this.validApiKeys.has(apiKey)) {
    if (!apiKey || apiKey != this.validApiKey) {
      throw new UnauthorizedException('Access denied');
    }

    return true;
  }
}