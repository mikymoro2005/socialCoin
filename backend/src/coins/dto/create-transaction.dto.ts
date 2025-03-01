import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'ID dell\'utente destinatario',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  receiverId: string;

  @ApiProperty({
    description: 'Quantità di coin da trasferire',
    example: 5,
    minimum: 0.01
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Descrizione opzionale della transazione',
    example: 'Pagamento per il tuo post fantastico!',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'ID del post correlato (opzionale)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsString()
  postId?: string;

  @ApiProperty({
    description: 'ID del commento correlato (opzionale)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsString()
  commentId?: string;
} 