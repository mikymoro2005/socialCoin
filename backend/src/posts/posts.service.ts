import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    
    private usersService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const user = await this.usersService.findOne(userId);
    
    const post = this.postsRepository.create({
      ...createPostDto,
      userId,
      user,
    });
    
    return this.postsRepository.save(post);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ posts: Post[], total: number, page: number, limit: number }> {
    const [posts, total] = await this.postsRepository.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    
    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string): Promise<Post> {
    const post = await this.findOne(id);
    
    if (post.userId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }
    
    await this.postsRepository.update(id, updatePostDto);
    
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.findOne(id);
    
    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    
    await this.postsRepository.delete(id);
  }

  async likePost(id: string, userId: string): Promise<Post> {
    const post = await this.findOne(id);
    
    // In una implementazione reale, verificheremmo se l'utente ha già messo like
    // e gestiremmo una tabella di relazione per i like
    
    post.likes += 1;
    await this.postsRepository.save(post);
    
    return post;
  }

  async addComment(postId: string, content: string, userId: string): Promise<Comment> {
    const post = await this.findOne(postId);
    const user = await this.usersService.findOne(userId);
    
    const comment = this.commentsRepository.create({
      content,
      postId,
      userId,
      post,
      user,
    });
    
    return this.commentsRepository.save(comment);
  }

  async getComments(postId: string, page: number = 1, limit: number = 10): Promise<{ comments: Comment[], total: number, page: number, limit: number }> {
    await this.findOne(postId); // Verifica che il post esista
    
    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { postId },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    
    return {
      comments,
      total,
      page,
      limit,
    };
  }

  async sendCoins(postId: string, amount: number, senderId: string): Promise<Post> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }
    
    const post = await this.findOne(postId);
    const sender = await this.usersService.findOne(senderId);
    const receiver = await this.usersService.findOne(post.userId);
    
    if (senderId === post.userId) {
      throw new BadRequestException('You cannot send coins to yourself');
    }
    
    if (sender.coinBalance < amount) {
      throw new BadRequestException('Insufficient coin balance');
    }
    
    // Aggiorna i saldi
    await this.usersService.updateCoinBalance(senderId, -amount);
    await this.usersService.updateCoinBalance(post.userId, amount);
    
    // Aggiorna il conteggio dei coin ricevuti dal post
    post.coinsReceived += amount;
    await this.postsRepository.save(post);
    
    // In una implementazione reale, registreremmo anche la transazione
    
    return post;
  }
} 