import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Bank } from './entities/bank.entity';
import { BanksService } from './banks.service';

@Controller('banks')
export class BanksController {
  /**
   * Inyecta el servicio que contiene la lógica
   * de gestión de bancos.
   */
  constructor(private readonly banksService: BanksService) {}

  /**
   * Registra un nuevo banco.
   *
   * POST /banks
   */
  @Post()
  create(@Body() createBankDto: CreateBankDto): Promise<Bank> {
    return this.banksService.create(createBankDto);
  }

  /**
   * Obtiene todos los bancos registrados.
   *
   * GET /banks
   */
  @Get()
  findAll(): Promise<Bank[]> {
    return this.banksService.findAll();
  }

  /**
   * Obtiene únicamente los bancos activos.
   *
   * GET /banks/active
   */
  @Get('active')
  findAllActive(): Promise<Bank[]> {
    return this.banksService.findAllActive();
  }

  /**
   * Obtiene un banco mediante su identificador.
   *
   * GET /banks/:id
   */
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Bank> {
    return this.banksService.findOne(id);
  }

  /**
   * Modifica parcialmente un banco existente.
   *
   * PATCH /banks/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBankDto: UpdateBankDto,
  ): Promise<Bank> {
    return this.banksService.update(id, updateBankDto);
  }

  /**
   * Reactiva un banco previamente desactivado.
   *
   * PATCH /banks/:id/restore
   */
  @Patch(':id/restore')
  restore(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Bank> {
    return this.banksService.restore(id);
  }

  /**
   * Desactiva un banco mediante borrado lógico.
   *
   * DELETE /banks/:id
   */
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Bank> {
    return this.banksService.remove(id);
  }
}