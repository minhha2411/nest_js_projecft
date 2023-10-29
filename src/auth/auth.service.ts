import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto } from './auth.interface';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Token, TokenDocument } from 'src/schema/token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(body: SignUpDto) {
    const isUserExist = await this.userService.findUserByName(body.username);

    if (isUserExist) {
      throw new HttpException('User already Exists', HttpStatus.CONFLICT);
    }
    const hashPassword = await bcrypt.hash(
      body.password,
      Number(process.env.SALT_PASSWORD),
    );
    const userObject = {
      ...body,
      password: hashPassword,
    };
    const createdUser = this.userService.createUser(userObject);
    return createdUser;
  }

  async login(body: SignUpDto) {
    const user = await this.userService.findUserByName(body.username);

    if (!user) {
      throw new NotFoundException();
    }
    const isPasswordMatch = await bcrypt.compare(body.password, user.password);
    if (!isPasswordMatch) {
      throw new HttpException('Wrong password', HttpStatus.BAD_REQUEST);
    }
    const token = await this.getToken(user.username);
    return token;
  }

  async getToken(userName: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { userName },
        { expiresIn: '10s', secret: process.env.JWT_ACCESS_SECRET },
      ),
      this.jwtService.signAsync(
        { userName },
        { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userName: string, refreshToken: string) {
    await this.tokenModel.findOneAndUpdate(userName, { refreshToken });
  }

  async refreshToken() {}
}
