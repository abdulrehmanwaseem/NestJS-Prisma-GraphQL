import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Response } from 'express';
import { CreateUserInput } from '../user/dto/create-user.input';
import { AuthService } from './auth.service';
import { SignInInput } from './dto/signIn.input';
import { AuthPayload } from './entities/auth-payload';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtUser } from './types/jwt-user';
import { AuthGuard } from '@common/guards/auth.guard';
import { UserService } from '../user/user.service';
import { clearAuthCookie } from '@common/utils/auth-cookie.util';
import { ConfigService } from '@nestjs/config';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => User)
  getProfile(@CurrentUser() user: JwtUser) {
    return this.userService.findOne(user.userId);
  }

  @Mutation(() => AuthPayload)
  async signUp(
    @Args('input') input: CreateUserInput,
    @Context('res') res: Response,
  ) {
    const user = await this.authService.registerUser(input);
    return await this.authService.login(user, res);
  }

  @Mutation(() => AuthPayload)
  async signIn(
    @Args('input') input: SignInInput,
    @Context('res') res: Response,
  ) {
    const user = await this.authService.validateLocalUser(input);
    return await this.authService.login(user, res);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => String)
  enable2FA() {}

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  logout(@Context('res') res: Response) {
    clearAuthCookie(res, this.configService);
    return true;
  }
}
