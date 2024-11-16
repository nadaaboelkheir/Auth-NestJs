import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../db/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should call repository.save() when signing up a user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Ahmed Ali',
      email: 'ahmed.ali@example.com',
      latitude: 30.0444,
      longitude: 31.2357,
    };

    const mockUser = {
      ...createUserDto,
      id: 1,
      city: 'Cairo',
    };

    jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as User);
    jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as User);

    const result = await userService.signUp(createUserDto);
    expect(result).toEqual(mockUser);
    expect(userRepository.create).toHaveBeenCalledWith({
      ...createUserDto,
      city: 'Cairo',
    });
    expect(userRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should call repository.findOne() and return a user profile', async () => {
    const mockUser = {
      id: 1,
      name: 'Ahmed Ali',
      email: 'ahmed.ali@example.com',
      city: 'Cairo',
    } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

    const result = await userService.getUserProfile(1);
    expect(result).toEqual(mockUser);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
