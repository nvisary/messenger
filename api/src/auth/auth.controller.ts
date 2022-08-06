import {
  Body,
  Controller,
  Get,
  Post,
  Response,
  UseGuards,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  public async login(
    @Body() { username, password }: { username: string; password: string },
    @Response() res: ExpressResponse,
  ) {
    const response = await this.authService.loginUser(username, password);

    if (response.ok) {
      this.authService.saveTokenToCookie(response.token, res);
    }

    res.send(response);
  }

  @Post('/register')
  public async register(
    @Body() { username, password }: { username: string; password: string },
  ) {
    return this.authService.createUser(username, password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/test')
  public async testAuth() {
    return 'You are authorized';
  }
}
