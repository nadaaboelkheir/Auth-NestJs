import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config'; 
import { UserService } from './users.service';
import { LocationService } from '../helpers/LocationService';
import { UserController } from './users.controller';
import { User } from '../db/user.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({ secret: 'your-secret-key', signOptions: { expiresIn: '1h' } }),
    ConfigModule.forRoot(),  
  ],
  controllers: [UserController],
  providers: [UserService, LocationService],
})
export class UsersModule {}
