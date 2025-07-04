import { Module } from '@nestjs/common';
import { TimepadClientAuthService } from "./timepad-client-auth.service";

@Module({
  providers: [TimepadClientAuthService],
  exports: [TimepadClientAuthService]
})
export class ClientAuthModule {}
