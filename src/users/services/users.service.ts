/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { SignupDto } from '../dto/signup.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { JwtPayload } from '../../utils/jwt/jwt-payload';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly   jwtService:JwtService,
    private readonly   configService:ConfigService
  ) {}
  //Register
  async signup(body: SignupDto) {
    const user = await this.findUserByEmail(body.email);
    if (user) throw new ConflictException('Email Already exists');
    body.password = await this.hashPassword(body.password);
    const newUser = this.userRepository.create(body);
    const saveUser=await this.userRepository.save(newUser)
    return saveUser ;
  }

  //Login
  async signIn(body: LoginUserDto) {
    const { email, password } = body;
    const user = await this.findUserByEmail(email);
    if (!user) throw new ConflictException('Invalid email or password');
    const matchedPassword = await this.comparePassword(password, user.password);
    if (!matchedPassword)
      throw new ConflictException('Invalid email or password');
    delete user.password;
    const payload: JwtPayload = {
      username: user.username,
      email: user.email,
      id: user.id,
      role:user.roles
    };
    const secret = this.configService.get<string>('JWT_SECRET');
    const accessToken = this.jwtService.sign(payload, {
      secret, 
      expiresIn: '1h',
    });

    return { accessToken, user };
  }
//Find Users
async findAllUsers(){
 return await this.userRepository.find()
}
async findUserById(id): Promise<any> {
  return await  this.userRepository.findOne({where:{id}})

}
  //helpers
  async findUserByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }
  //hash Password
  async hashPassword(password: string) {
    return await hash(password, 10);
  }
  async comparePassword(password: string, userPassword: string) {
    return await compare(password, userPassword);
  }
}
