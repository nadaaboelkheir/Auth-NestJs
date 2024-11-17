import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { Repository } from 'typeorm';
import { User } from '../db/user.schema';
import { LocationService } from '../helpers/LocationService';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockUserRepository = {
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockLocationService = {
  getLocation: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let locationService: LocationService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: LocationService, useValue: mockLocationService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    locationService = module.get<LocationService>(LocationService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user and return the user with a token', async () => {
      const createUserDto = { 
        name: 'John Doe', 
        email: 'john@example.com', 
        latitude: 30.0444, 
        longitude: 31.2357 
      };
      const locationResponse = { city: 'Cairo', country: 'EG' };
      const createdUser = { id: '1', ...createUserDto, city: 'Cairo' };
      const token = 'mockToken';

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockLocationService.getLocation.mockResolvedValue(locationResponse);
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);
      mockJwtService.signAsync.mockResolvedValue(token);

      const result = await userService.create(createUserDto);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(mockLocationService.getLocation).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.create).toHaveBeenCalledWith({ ...createUserDto, city: 'Cairo' });
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ userId: createdUser.id });
      expect(result).toEqual({ user: createdUser, token });
    });

    it('should throw a ConflictException if the email already exists', async () => {
      const createUserDto = { 
        name: 'John Doe', 
        email: 'john@example.com', 
        latitude: 30.0444, 
        longitude: 31.2357 
      };
      mockUserRepository.findOneBy.mockResolvedValue({ id: '1', email: 'john@example.com' });

      await expect(userService.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: createUserDto.email });
    });

    it('should throw a BadRequestException if location is not in Egypt', async () => {
      const createUserDto = { 
        name: 'John Doe', 
        email: 'john@example.com', 
        latitude: 30.0444, 
        longitude: 31.2357 
      };
      const locationResponse = { city: 'Cairo', country: 'US' };

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockLocationService.getLocation.mockResolvedValue(locationResponse);

      await expect(userService.create(createUserDto)).rejects.toThrow(BadRequestException);
      expect(mockLocationService.getLocation).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getUserProfile', () => {
    it('should return the user profile', async () => {
      const userId = '1';
      const userProfile = { name: 'John Doe', email: 'john@example.com', city: 'Cairo' };

      mockUserRepository.findOne.mockResolvedValue(userProfile);

      const result = await userService.getUserProfile(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, select: ['name', 'email', 'city'] });
      expect(result).toEqual(userProfile);
    });

    it('should throw a NotFoundException if the user is not found', async () => {
      const userId = '1';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(userService.getUserProfile(userId)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, select: ['name', 'email', 'city'] });
    });
  });
});
