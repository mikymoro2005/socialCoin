import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class CoinsService {
  constructor(
    @InjectRepository(CoinTransaction)
    private transactionsRepository: Repository<CoinTransaction>,
    private usersService: UsersService,
  ) {}

  async transfer(createTransactionDto: CreateTransactionDto, senderId: string): Promise<CoinTransaction> {
    const { receiverId, amount, description, postId, commentId } = createTransactionDto;
    
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot transfer coins to yourself');
    }
    
    const sender = await this.usersService.findOne(senderId);
    const receiver = await this.usersService.findOne(receiverId);
    
    if (sender.coinBalance < amount) {
      throw new BadRequestException('Insufficient coin balance');
    }
    
    // Aggiorna i saldi
    await this.usersService.updateCoinBalance(senderId, -amount);
    await this.usersService.updateCoinBalance(receiverId, amount);
    
    // Crea la transazione
    const transaction = this.transactionsRepository.create({
      amount,
      description,
      postId,
      commentId,
      senderId,
      receiverId,
      sender,
      receiver,
      type: postId ? 'post_reward' : commentId ? 'comment_reward' : 'direct_transfer',
    });
    
    return this.transactionsRepository.save(transaction);
  }

  async getBalance(userId: string): Promise<{ balance: number }> {
    const user = await this.usersService.findOne(userId);
    return { balance: user.coinBalance };
  }

  async getUserTransactions(
    userId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ transactions: CoinTransaction[], total: number, page: number, limit: number }> {
    const [transactions, total] = await this.transactionsRepository.findAndCount({
      where: [
        { senderId: userId },
        { receiverId: userId },
      ],
      relations: ['sender', 'receiver'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    
    return {
      transactions,
      total,
      page,
      limit,
    };
  }

  async getTransaction(id: string, userId: string): Promise<CoinTransaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });
    
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    
    // Verifica che l'utente sia coinvolto nella transazione
    if (transaction.senderId !== userId && transaction.receiverId !== userId) {
      throw new ForbiddenException('You can only view transactions you are involved in');
    }
    
    return transaction;
  }
} 