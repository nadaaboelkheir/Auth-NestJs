import { Controller, Get, Param, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../db/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/:id - Get user by ID
  @Get(':id')
  async getUser(@Param('id') id: number): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  // POST /users/signup - Create new user
  @Post('signup')
  async createUser(@Body() userData: Partial<User>): Promise<User> {
    if (!this.isEgyptianCoordinates(userData.latitude, userData.longitude)) {
      throw new HttpException('Location not in Egypt', HttpStatus.BAD_REQUEST);
    }

    // Simulate city derivation from coordinates (replace with actual implementation)
    userData.city = 'Cairo'; // Example: Replace with a geocoding library

    return this.usersService.create(userData);
  }

  // Helper to check if coordinates are in Egypt
  private isEgyptianCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= 22.0 &&
      latitude <= 31.0 &&
      longitude >= 24.0 &&
      longitude <= 37.0
    );
  }
}
