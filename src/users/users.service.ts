import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../db/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    async signUp(createUserDto: CreateUserDto): Promise<User> {
        // Convert latitude/longitude to city name (can use a geocoding API or mock for now)
        const city = 'Cairo'; // Placeholder

        const user = this.userRepository.create({
            ...createUserDto,
            city,
        });

        return await this.userRepository.save(user);
    }
    async getUserProfile(userId: number): Promise<User> {
      return await this.userRepository.findOne({ where: { id: userId } });
  }
    isInEgypt(latitude: number, longitude: number): boolean {
        // Logic to determine if coordinates are in Egypt.
        return true; // Placeholder
    }
}
