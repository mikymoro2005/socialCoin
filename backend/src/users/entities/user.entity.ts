import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../posts/entities/comment.entity';
import { CoinTransaction } from '../../coins/entities/coin-transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true }) // Non esporre la password nelle risposte
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ default: 0 })
  coinBalance: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: 1.0 }) // Ogni utente inizia con 1 coin
  coins: number;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ default: 0 })
  dailyCoinsEarned: number; // Monitoraggio dei coin guadagnati giornalmente

  @Column({ default: 0 })
  dailyCoinsSent: number; // Monitoraggio dei coin inviati giornalmente

  @Column({ type: 'datetime', nullable: true })
  lastDailyReset: Date; // Data dell'ultimo reset giornaliero

  @Column({ type: 'datetime', nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relazioni con altre entità
  @OneToMany(() => Post, post => post.user)
  posts: Post[];

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @OneToMany(() => CoinTransaction, transaction => transaction.sender)
  sentTransactions: CoinTransaction[];

  @OneToMany(() => CoinTransaction, transaction => transaction.receiver)
  receivedTransactions: CoinTransaction[];
} 