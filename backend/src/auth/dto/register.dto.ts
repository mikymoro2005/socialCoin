import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Il nome utente è obbligatorio' })
  @IsString({ message: 'Il nome utente deve essere una stringa' })
  @MinLength(3, { message: 'Il nome utente deve contenere almeno 3 caratteri' })
  username: string;

  @IsNotEmpty({ message: 'L\'email è obbligatoria' })
  @IsEmail({}, { message: 'L\'email non è valida' })
  email: string;

  @IsNotEmpty({ message: 'La password è obbligatoria' })
  @IsString({ message: 'La password deve essere una stringa' })
  @MinLength(8, { message: 'La password deve contenere almeno 8 caratteri' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La password deve contenere almeno una lettera maiuscola, una minuscola e un numero o carattere speciale',
  })
  password: string;
} 