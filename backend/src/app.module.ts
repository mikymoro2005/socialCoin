import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CoinsModule } from './coins/coins.module';

@Module({
  imports: [
    // Configurazione delle variabili d'ambiente
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Configurazione del database (SQLite per sviluppo locale)
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'socialcoin.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Solo in sviluppo
    }),
    
    // Configurazione Redis per la cache (disabilitata per ora)
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 60, // 1 ora di default
    }),
    
    // Moduli dell'applicazione
    UsersModule,
    AuthModule,
    PostsModule,
    CoinsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
