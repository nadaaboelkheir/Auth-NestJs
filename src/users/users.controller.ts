import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiHeaders,
} from '@nestjs/swagger';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../helpers/AuthGuard';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The created user',
    example: {
      token: 'string',
      id: 'string',
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input body',
  })
  signup(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }
  @UseGuards(AuthGuard)
  @Get('/:user_id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user profile',
    example: {
      name: 'string',
      email: 'string',
      city: 'string',
    },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiParam({
    name: 'user_id',
    description: 'The target user id',
    type: 'string',
  })
  @ApiHeaders([
    {
      name: 'token',
      description: 'access token',
    },
  ])
  getProfile(@Param('user_id') userId: string) {
    return this.userService.getUserProfile(userId);
  }
}
