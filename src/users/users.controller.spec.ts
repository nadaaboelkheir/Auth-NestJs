import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            signUp: jest.fn(),
            isInEgypt: jest.fn().mockReturnValue(true),
            getUserProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should sign up a user and return the created user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Ahmed Ali',
      email: 'ahmed.ali@example.com',
      latitude: 30.0444,
      longitude: 31.2357,
    };

    const mockUser = {
      id: 1,
      ...createUserDto,
      city: 'Cairo',
    };

    jest.spyOn(service, 'signUp').mockResolvedValue(mockUser);

    const result = await controller.signUp(createUserDto);
    expect(result).toEqual(mockUser);
    expect(service.signUp).toHaveBeenCalledWith(createUserDto);
  });

  it('should reject signup outside Egypt', async () => {
    jest.spyOn(service, 'isInEgypt').mockReturnValue(false);

    const createUserDto: CreateUserDto = {
      name: 'Ahmed Ali',
      email: 'ahmed.ali@example.com',
      latitude: 35.0,
      longitude: 40.0,
    };

    await expect(controller.signUp(createUserDto)).rejects.toThrow(
      HttpException,
    );
  });

  it('should return user profile', async () => {
    const mockUser = {
      id: 1,
      name: 'Ahmed Ali',
      email: 'ahmed.ali@example.com',
      city: 'Cairo',
      latitude: 30.0444,  
      longitude: 31.2357, 
    };

    jest.spyOn(service, 'getUserProfile').mockResolvedValue(mockUser);

    const result = await controller.getProfile(1);
    expect(result).toEqual(mockUser);
    expect(service.getUserProfile).toHaveBeenCalledWith(1);
  });

  it('should return 404 if user not found', async () => {
    jest.spyOn(service, 'getUserProfile').mockResolvedValue(null);

    await expect(controller.getProfile(1)).rejects.toThrow(HttpException);
  });
});
