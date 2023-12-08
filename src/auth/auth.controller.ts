import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User registration' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      example1: {
        value: { email: 'test@example.com', password: 'password123' },
        summary: 'User registration example',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return user;
  }

  @ApiOperation({ summary: 'Confirm user email' })
  @ApiResponse({ status: 200, description: 'Email confirmed successfully' })
  @Get('confirm')
  async confirm(@Query('token') token: string) {
    const result = await this.authService.confirmEmail(token);
    return result;
  }

  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    type: LoginDto,
    examples: {
      example1: {
        value: { email: 'test@example.com', password: 'password123' },
        summary: 'User login example',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: () => ({ access_token: String }),
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.login(loginDto);
    return { access_token: token };
  }
}
