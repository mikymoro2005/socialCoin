import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../posts/entities/comment.entity';

// Enum per i tipi di transazione
export enum TransactionType {
  LIKE = 'like',
  COMMENT = 'comment',
  SHARE = 'share',
  BOOST = 'boost',
  TRANSFER = 'transfer',
  SYSTEM = 'system', // Per transazioni generate dal sistema
  PURCHASE = 'purchase', // Per acquisto di coin con denaro reale
}

@Entity('coin_transactions')
export class CoinTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'varchar',
    default: 'direct_transfer'
  })
  type: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  postId: string;

  @Column({ nullable: true })
  commentId: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relazioni
  @ManyToOne(() => User, (user) => user.sentTransactions)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => User, (user) => user.receivedTransactions)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  receiverId: string;

  @ManyToOne(() => Post, { nullable: true })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;
} 