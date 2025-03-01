import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'L\'email è obbligatoria' })
  @IsEmail({}, { message: 'L\'email non è valida' })
  email: string;

  @IsNotEmpty({ message: 'La password è obbligatoria' })
  @IsString({ message: 'La password deve essere una stringa' })
  password: string;
} 