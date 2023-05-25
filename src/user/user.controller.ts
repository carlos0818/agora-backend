import { Controller, Post, Body } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

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

  @Post('verifySocial')
  @ApiResponse({ status: 200, description: 'User was created' })
  verifySocial(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.verifySocial(registerUserDto);
  }
}
