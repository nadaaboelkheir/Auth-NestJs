import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { AuthGuard } from '../helpers/AuthGuard';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

const mockUserService = {
  create: jest.fn(),
  getUserProfile: jest.fn(),
};

const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('UserController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    userController = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return the user with a token', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        latitude: 30.0444,
        longitude: 31.2357,
      };
      const createdUser = {
        token: 'mockToken',
        user: { id: '1', ...createUserDto, city: 'Cairo' },
      };

      mockUserService.create.mockResolvedValue(createdUser);

      const result = await userController.signup(createUserDto);

      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
    });

    it('should throw a ConflictException if the email already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        latitude: 30.0444,
        longitude: 31.2357,
      };

      mockUserService.create.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(userController.signup(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw a BadRequestException if invalid data is provided', async () => {
      const createUserDto: any = {
        email: 'john@example.com', // Missing name, latitude, and longitude
      };

      mockUserService.create.mockRejectedValue(
        new BadRequestException('Invalid input body'),
      );

      await expect(userController.signup(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const userId = '1';
      const userProfile = {
        name: 'John Doe',
        email: 'john@example.com',
        city: 'Cairo',
      };

      mockUserService.getUserProfile.mockResolvedValue(userProfile);

      const result = await userController.getProfile(userId);

      expect(mockUserService.getUserProfile).toHaveBeenCalledWith(userId);
      expect(result).toEqual(userProfile);
    });

    it('should throw a NotFoundException if the user is not found', async () => {
      const userId = '1';

      mockUserService.getUserProfile.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(userController.getProfile(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserService.getUserProfile).toHaveBeenCalledWith(userId);
    });

    it('should throw an UnauthorizedException if the AuthGuard fails', async () => {
      const userId = '1';

      mockAuthGuard.canActivate.mockReturnValue(false);

      const module: TestingModule = await Test.createTestingModule({
        controllers: [UserController],
        providers: [{ provide: UserService, useValue: mockUserService }],
      })
        .overrideGuard(AuthGuard)
        .useValue(mockAuthGuard)
        .compile();

      const protectedController = module.get<UserController>(UserController);

      await expect(protectedController.getProfile(userId)).rejects.toThrow();
      expect(mockUserService.getUserProfile).not.toHaveBeenCalled();
    });
  });
});
