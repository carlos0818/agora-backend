import { Controller, Post, Body, Get, Query, Req } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterSocialUserDto } from './dto/register-social-user.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { LoginTokenDto } from './dto/login-token.dto';
import { Login } from './entities/login.entity';
import { VerifyUserDto } from './dto/verifyUser.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { FindByIdDto } from './dto/findById.dto';
import { Request } from 'express';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @ApiResponse({ status: 200, description: 'Successfully login', type: Login })
  @ApiResponse({ status: 400, description: 'Incorrect credentials' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post('login-token')
  @ApiResponse({ status: 200, description: 'Successfully Login', type: Login })
  loginToken(@Body() loginTokenDto: LoginTokenDto) {
    return this.userService.loginToken(loginTokenDto);
  }

  @Post('register')
  @ApiResponse({ status: 200, description: 'User was created' })
  @ApiResponse({ status: 400, description: 'Incorrect captcha / Email is already exists' })
  @ApiResponse({ status: 500, description: 'Unexpected error, try again.' })
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  @Post('user-exists')
  @ApiResponse({ status: 200, description: 'User was created', type: Login })
  @ApiResponse({ status: 400, description: 'The user does not exist' })
  userExists(@Body() registerSocialUserDto: RegisterSocialUserDto) {
    return this.userService.userExists(registerSocialUserDto);
  }

  @Post('login-social')
  @ApiResponse({ status: 200, description: 'Successfully login', type: Login })
  @ApiResponse({ status: 400, description: 'This email is already registered with another account type' })
  loginSocial(@Body() registerSocialUserDto: RegisterSocialUserDto) {
    return this.userService.loginSocial(registerSocialUserDto);
  }

  @Get('activate-account')
  @ApiResponse({ status: 200, description: 'Your account was activated', type: Login })
  @ApiResponse({ status: 400, description: 'We cannot find your registered user / Your account has already been activated previously' })
  activateAccount(@Query() activateAccountDto: ActivateAccountDto) {
    return this.userService.activateAccount(activateAccountDto);
  }

  // @Get('is-my-account')
  // isMyAccount(@Query() findByIdDto: FindByIdDto, @Req() req: Request) {
  //   const token = req.headers.authorization ? req.headers?.authorization.split(' ')[1] : '';
  //   return this.userService.isMyAccount(findByIdDto, token);
  // }

  @Post('update-user-info')
  updateUserInfo(@Body() updateUserInfoDto: UpdateUserInfoDto) {
    return this.userService.updateUserInfo(updateUserInfoDto);
  }

  @Get('load-user-data')
  loadUserData(@Query() verifyUserDto: VerifyUserDto) {
    return this.userService.loadUserData(verifyUserDto);
  }

  // @Get('id-exists')
  // idExists(@Query() findByIdDto: FindByIdDto) {
  //   return this.userService.idExists(findByIdDto);
  // }
}
