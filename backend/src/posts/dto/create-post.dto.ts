import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Il contenuto testuale del post',
    example: 'Questo è il mio primo post su SocialCoin!'
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'URL dell\'immagine o media allegato al post (opzionale)',
    example: 'https://example.com/image.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiProperty({
    description: 'Indica se il post è premium (visibile solo agli utenti premium)',
    example: false,
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
} 