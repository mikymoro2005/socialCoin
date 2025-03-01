import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  coinsReceived: number;

  @Column({ default: false })
  isPremium: boolean; // Se è un post premium (commenti a pagamento)

  @Column({ default: 0 })
  boostAmount: number; // Quantità di coin spesi per il boost

  @Column({ type: 'datetime', nullable: true })
  boostExpiresAt: Date; // Quando scade il boost

  @Column({ default: false })
  isVisible: boolean; // Se il post è visibile o nascosto

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relazioni
  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
} 