import { Controller } from '@nestjs/common';
import { ClientAuthService } from './client-auth.service';

@Controller('client-auth')
export class ClientAuthController {
  constructor(private readonly clientAuthService: ClientAuthService) {}
}
