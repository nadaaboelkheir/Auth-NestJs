import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @ApiBody({ type: CreateUserDto })
  async signUp(@Body() createUserDto: CreateUserDto) {
    const { latitude, longitude } = createUserDto;

    if (!this.userService.isInEgypt(latitude, longitude)) {
      throw new HttpException(
        'Sign up is restricted to Egyptian locations.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.userService.signUp(createUserDto);
  }
  @Get(':user_id')
  async getProfile(@Param('user_id') userId: number) {
    const user = await this.userService.getUserProfile(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
