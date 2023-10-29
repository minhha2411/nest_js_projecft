import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './user.interface';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';

@Controller('user')
@UseGuards(AccessTokenGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  getAllUser() {
    return this.userService.findAllUser();
  }

  @Get('/:id')
  getUserById(@Param() id: string) {
    return this.userService.findUserById(id);
  }
}
