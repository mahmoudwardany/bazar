/* eslint-disable prettier/prettier */
import { Controller, Post, Body, HttpCode, Get, Param, UseGuards } from '@nestjs/common';
import { SignupDto } from '../dto/signup.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UserService } from '../services/users.service';
import { AuthenticationGuard } from 'src/utils/guard/auth.guard';
import { AuthorizedGuard } from 'src/utils/guard/authorized-role.guard';
import { Roles } from 'src/utils/common/Roles.enum';



@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService ) {}
  // Register a new user
  @Post('register')
  async register(@Body() body: SignupDto) {
    return await this.userService.signup(body);
  }

  // User login
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginUserDto) {
    return await this.userService.signIn(body);
  }
  @UseGuards(AuthenticationGuard,AuthorizedGuard([Roles.ADMIN]))
  @Get()
  async findAllUsers(){
    return await this.userService.findAllUsers()
  }
  @Get(":id")
  async findUser(@Param("id") id:number){
    return await this.userService.findUserById(id)
  }
}
