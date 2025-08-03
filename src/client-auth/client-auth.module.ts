import { Module } from '@nestjs/common';
import { TimepadClientAuthService } from './timepad-client-auth.service';
import { LeaderClientAuthService } from './leader-client-auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TimepadClientAuthService, LeaderClientAuthService],
  exports: [TimepadClientAuthService, LeaderClientAuthService],
})
export class ClientAuthModule {}
