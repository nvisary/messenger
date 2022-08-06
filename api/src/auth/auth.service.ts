import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

import { User } from './user.model';
import { JwtPayload } from './jwt.strategy';

const ERROR_MESSAGES = {
  USERNAME_REQUIRED: 'Username required',
  PASSWORD_REQUIRED: 'Password required',
  USER_NOT_FOUNDED: 'User not found or password incorrect',
  FAILED_TO_CREATE: 'Failed to create user',
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  private static readonly tokenCookieKey: string = 'token';

  public async createUser(username?: string, password?: string) {
    if (!username) {
      return { ok: false, message: ERROR_MESSAGES.USERNAME_REQUIRED };
    }

    if (!password) {
      return { ok: false, message: ERROR_MESSAGES.PASSWORD_REQUIRED };
    }

    const user = await this.findUserByUsername(username);

    const response = { ok: true, message: `User ${username} created` };

    if (user) {
      response.ok = false;
      response.message = `User ${username} already exist`;
    }

    if (!user) {
      const newUser = new this.userModel({
        username,
        passwordHash: AuthService.generatePasswordHash(password),
      });

      try {
        await newUser.save();
      } catch (e) {
        response.ok = false;
        response.message = ERROR_MESSAGES.FAILED_TO_CREATE;
      }
    }

    return response;
  }

  public findUserByUsername(username: string): Promise<User> {
    return this.userModel.findOne({ username }).exec();
  }

  public async loginUser(username?: string, password?: string) {
    if (!username) {
      return { ok: false, message: ERROR_MESSAGES.USERNAME_REQUIRED };
    }

    if (!password) {
      return { ok: false, message: ERROR_MESSAGES.PASSWORD_REQUIRED };
    }

    const user: User = await this.findUserByUsername(username);
    if (!user) {
      return { ok: false, message: ERROR_MESSAGES.USER_NOT_FOUNDED };
    }

    const result = await this.validatePassword(user, password);

    if (!result) {
      return { ok: false, message: ERROR_MESSAGES.USER_NOT_FOUNDED };
    }

    const token: string = this.createJwtPayload(user);

    return {
      token,
      ok: true,
      message: 'Success',
    };
  }

  public async validatePassword(user: User, password: string) {
    return (await bcrypt.compare(password, user?.passwordHash ?? ''))
      ? user
      : null;
  }

  public async getUserByJwtPayload(payload: JwtPayload) {
    return this.findUserByUsername(payload.username);
  }

  public createJwtPayload({ _id, username }: User) {
    return this.jwtService.sign({ _id, username });
  }

  private static generatePasswordHash(password: string, saltRounds = 10) {
    return bcrypt.hashSync(password, saltRounds);
  }

  public saveTokenToCookie(token: string, res: Response) {
    const expires = new Date(
      Date.now() + 3600000 * Number(process.env.TOKEN_LIFETIME),
    );
    res.cookie(AuthService.tokenCookieKey, token, { expires });
  }
}
