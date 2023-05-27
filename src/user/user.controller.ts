import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterSocialUserDto } from './dto/register-social-user.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { LoginTokenDto } from './dto/login-token.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @ApiResponse({ status: 200, description: 'Successfully Login', type: [User] })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post('login-token')
  @ApiResponse({ status: 200, description: 'Successfully Login', type: [User] })
  loginToken(@Body() loginTokenDto: LoginTokenDto) {
    return this.userService.loginToken(loginTokenDto);
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

  @Get('activate-account')
  // @ApiResponse({ status: 200, description: 'User was created' })
  activateAccount(@Query() activateAccountDto: ActivateAccountDto) {
    return this.userService.activateAccount(activateAccountDto);
  }
}
