import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    // Verifica se l'utente esiste già
    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email già in uso');
      }
      throw new ConflictException('Nome utente già in uso');
    }

    // Hash della password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crea il nuovo utente
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      lastDailyReset: new Date(), // Imposta la data di reset giornaliero
    });

    await this.usersRepository.save(user);

    // Genera il token JWT
    const token = this.generateToken(user);

    // Rimuovi la password dalla risposta
    const { password: _, ...result } = user;

    return {
      user: result,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Trova l'utente per email
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    // Verifica se l'utente esiste e la password è corretta
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    // Aggiorna la data dell'ultimo login
    user.lastLogin = new Date();
    await this.usersRepository.save(user);

    // Genera il token JWT
    const token = this.generateToken(user);

    // Rimuovi la password dalla risposta
    const { password: _, ...result } = user;

    return {
      user: result,
      token,
    };
  }

  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }
} 