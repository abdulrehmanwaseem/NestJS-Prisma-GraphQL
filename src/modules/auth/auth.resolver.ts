import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import { User } from 'src/entities/user.entity';
import { CreateUserInput } from '../user/dto/create-user.input';
import { AuthService } from './auth.service';
import { AuthPayload } from './entities/auth-payload';
import { SignInInput } from './dto/signIn.input';
import { Request, Response } from 'express';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User)
  signUp(@Args('input') input: CreateUserInput) {
    return this.authService.registerUser(input);
  }

  @Mutation(() => AuthPayload)
  async signIn(
    @Args('input') input: SignInInput,
    @Context('res') res: Response,
    @Context('req') req: Request,
  ) {
    console.log(req.cookies['jwt']);
    const user = await this.authService.validateLocalUser(input);
    return await this.authService.login(user, res);
  }
}
