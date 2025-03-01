import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  Query, 
  Param 
} from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('coins')
@Controller('coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer coins to another user' })
  @ApiResponse({ status: 201, description: 'Transfer completed successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  transfer(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    return this.coinsService.transfer(createTransactionDto, req.user.id);
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user coin balance' })
  @ApiResponse({ status: 200, description: 'Return the coin balance.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getBalance(@Request() req) {
    return this.coinsService.getBalance(req.user.id);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user transactions' })
  @ApiResponse({ status: 200, description: 'Return the transactions.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getTransactions(
    @Request() req, 
    @Query('page') page: number = 1, 
    @Query('limit') limit: number = 10
  ) {
    return this.coinsService.getUserTransactions(req.user.id, page, limit);
  }

  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction by id' })
  @ApiResponse({ status: 200, description: 'Return the transaction.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  getTransaction(@Param('id') id: string, @Request() req) {
    return this.coinsService.getTransaction(id, req.user.id);
  }
} 