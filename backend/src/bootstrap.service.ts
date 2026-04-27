import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { AuthService } from './auth/auth.service';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private readonly authService: AuthService) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = process.env.INITIAL_ADMIN_EMAIL;
    const password = process.env.INITIAL_ADMIN_PASSWORD;

    if (!email || !password) return;

    try {
      await this.authService.signup({
        email,
        password,
        firstName: 'Admin',
        lastName: '',
      });
      this.logger.log(`Initial admin account created: ${email}`);
    } catch (err: any) {
      const isAlreadyExists =
        err?.status === 409 || err?.message?.includes('already exists');
      if (isAlreadyExists) {
        this.logger.debug(`Initial admin account already exists: ${email}`);
      } else {
        this.logger.error(
          `Failed to create initial admin account: ${err.message}`,
        );
      }
    }
  }
}
