import { Injectable } from '@nestjs/common';
import { SignUpDto } from './auth.interface';

@Injectable()
export class AuthService {
  signUp(body: SignUpDto) {
    return 'Hello World!';
  }
}
