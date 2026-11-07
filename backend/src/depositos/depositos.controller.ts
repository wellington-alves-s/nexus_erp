import { Controller, Get } from '@nestjs/common';
import { Deposito } from '../generated/prisma/client.js';
import { DepositosService } from './depositos.service.js';

@Controller('depositos')
export class DepositosController {
  constructor(private readonly depositos: DepositosService) {}

  @Get()
  listarAtivos(): Promise<Deposito[]> {
    return this.depositos.listarAtivos();
  }
}
