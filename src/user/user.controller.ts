import { Controller, Post, Body } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterSocialUserDto } from './dto/register-social-user.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @ApiResponse({ status: 200, description: 'Successfully Login', type: [User] })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post('register')
  @ApiResponse({ status: 200, description: 'User was created' })
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  @Post('user-exists')
  // @ApiResponse({ status: 200, description: 'User was created' })
  userExists(@Body() registerSocialUserDto: RegisterSocialUserDto) {
    return this.userService.userExists(registerSocialUserDto);
  }

  @Post('login-social')
  // @ApiResponse({ status: 200, description: 'User was created' })
  loginSocial(@Body() registerSocialUserDto: RegisterSocialUserDto) {
    return this.userService.loginSocial(registerSocialUserDto);
  }
}
