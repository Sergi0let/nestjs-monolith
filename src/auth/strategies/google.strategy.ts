import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const googleId = configService.get<string>('GOOGLE_CLIENT_ID');
    const googleSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const googleCallbackUrl = configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!googleId || !googleSecret || !googleCallbackUrl) {
      throw new Error('Google Id is not defined in configuration');
    }
    super({
      clientID: googleId,
      clientSecret: googleSecret,
      callbackURL: googleCallbackUrl,
      scope: 'email',
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    return profile;
  }
}
