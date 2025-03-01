import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`Utente con ID ${id} non trovato`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException(`Utente con email ${email} non trovato`);
    }
    
    return user;
  }

  async updateCoins(userId: string, amount: number): Promise<User> {
    const user = await this.findOne(userId);
    
    user.coins += amount;
    
    // Aggiorna i contatori giornalieri
    if (amount > 0) {
      user.dailyCoinsEarned += amount;
    } else if (amount < 0) {
      user.dailyCoinsSent += Math.abs(amount);
    }
    
    return this.usersRepository.save(user);
  }

  async updateCoinBalance(userId: string, amount: number): Promise<User> {
    const user = await this.findOne(userId);
    
    user.coinBalance += amount;
    
    // Aggiorna i contatori giornalieri
    if (amount > 0) {
      user.dailyCoinsEarned += amount;
    } else if (amount < 0) {
      user.dailyCoinsSent += Math.abs(amount);
    }
    
    return this.usersRepository.save(user);
  }

  async resetDailyCounters(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    
    user.dailyCoinsEarned = 0;
    user.dailyCoinsSent = 0;
    user.lastDailyReset = new Date();
    
    return this.usersRepository.save(user);
  }
} 