import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto } from './auth.interface';
import { Model } from 'mongoose';
import { UserDocument } from 'src/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  // constructor(
  //   @InjectModel('User') private readonly userModel: Model<UserDocument>,
  // ) {}
  constructor(private readonly userService: UserService) {}

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

    return user;
  }
}
