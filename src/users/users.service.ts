import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../db/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LocationService } from '../helpers/LocationService';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private locationService: LocationService,
    private jwtService: JwtService,
  ) {}
  /**
   * Creates a new user if the email is not already taken.
   *
   * @param {CreateUserDto} createUserDto The user data (name, email, latitude, longitude).
   * @throws {ConflictException} If the email already exists.
   * @return {Promise<User>} The created user.
   */
  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ user: User; token: string }> {
    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    let city: string;
    let country: string;
    try {
      const location = await this.locationService.getLocation(createUserDto);
      city = location.city;
      country = location.country;
    } catch (error) {
      throw new Error('Error fetching location data: ' + error.message);
    }

    // Validate the location is within Egypt
    if (!city || country !== 'EG') {
      throw new BadRequestException('The user location must be within Egypt');
    }
    const user = this.userRepository.create({
      ...createUserDto,
      city,
    });

    const savedUser = await this.userRepository.save(user);

    const token = await this.jwtService.signAsync({ userId: savedUser.id });

    return { user: savedUser, token };
  }

  /**
   * Gets the user profile by ID.
   *
   * @param {string} userId The ID of the user.
   * @throws {NotFoundException} If the user is not found.
   * @return {Promise<User>} The user's profile with name, email, and city.
   */
  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['name', 'email', 'city'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }
}
