import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from '../services/user.service';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { RegisterSocialUserDto } from '../dto/register-social-user.dto';
import { ActivateAccountDto } from '../dto/activate-account.dto';
import { LoginTokenDto } from '../dto/login-token.dto';
import { Login } from '../entities/login.entity';
import { VerifyUserDto } from '../dto/verifyUser.dto';
import { UpdateUserInfoDto } from '../dto/update-user-info.dto';
import { SendLinkForgotPasswordDto } from '../dto/send-link-forgot-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

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

  @Post('update-user-info')
  updateUserInfo(@Body() updateUserInfoDto: UpdateUserInfoDto) {
    return this.userService.updateUserInfo(updateUserInfoDto);
  }

  @Get('load-user-data')
  loadUserData(@Query() verifyUserDto: VerifyUserDto) {
    return this.userService.loadUserData(verifyUserDto);
  }

  @Post('send-link-forgot-password')
  sendLinkForgotPassword(@Body() sendLinkDto: SendLinkForgotPasswordDto) {
    return this.userService.sendLinkForgotPassword(sendLinkDto);
  }

  @Post('update-verified')
  updateVerified(@Body() activateAccountDto: ActivateAccountDto) {
    return this.userService.updateVerified(activateAccountDto);
  }

  @Post('change-password')
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(changePasswordDto);
  }
}
