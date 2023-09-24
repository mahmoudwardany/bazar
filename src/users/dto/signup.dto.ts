import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { LoginUserDto } from './login-user.dto';

export class SignupDto extends LoginUserDto {
  @IsString({ message: 'username Must be String' })
  @IsNotEmpty({ message: 'username is required' })
  @MinLength(3, { message: 'Min Length is 3' })
  @MaxLength(20, { message: 'Max Length is 20' })
  username: string;
}
