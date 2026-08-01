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
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Bank } from './entities/bank.entity';

/**
 * Agrupa los endpoints relacionados con la gestión de bancos
 * dentro de una misma sección de Swagger.
 */
@ApiTags('Banks')
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
  @ApiOperation({
    summary: 'Registrar un banco',
    description:
      'Crea un nuevo banco activo con el porcentaje de comisión indicado.',
  })
  @ApiCreatedResponse({
    description: 'El banco fue registrado correctamente.',
    type: Bank,
  })
  @ApiBadRequestResponse({
    description: 'Los datos enviados no cumplen las validaciones.',
  })
  @ApiConflictResponse({
    description: 'Ya existe un banco registrado con el mismo nombre.',
  })
  @Post()
  create(@Body() createBankDto: CreateBankDto): Promise<Bank> {
    return this.banksService.create(createBankDto);
  }

  /**
   * Obtiene todos los bancos registrados.
   *
   * GET /banks
   */
  @ApiOperation({
    summary: 'Consultar todos los bancos',
    description:
      'Devuelve todos los bancos registrados, incluyendo los bancos inactivos.',
  })
  @ApiOkResponse({
    description: 'Listado de bancos obtenido correctamente.',
    type: Bank,
    isArray: true,
  })
  @Get()
  findAll(): Promise<Bank[]> {
    return this.banksService.findAll();
  }

  /**
   * Obtiene únicamente los bancos activos.
   *
   * GET /banks/active
   */
  @ApiOperation({
    summary: 'Consultar los bancos activos',
    description:
      'Devuelve únicamente los bancos disponibles para nuevas liquidaciones.',
  })
  @ApiOkResponse({
    description: 'Listado de bancos activos obtenido correctamente.',
    type: Bank,
    isArray: true,
  })
  @Get('active')
  findAllActive(): Promise<Bank[]> {
    return this.banksService.findAllActive();
  }

  /**
   * Obtiene un banco mediante su identificador.
   *
   * GET /banks/:id
   */
  @ApiOperation({
    summary: 'Consultar un banco por su identificador',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador numérico del banco.',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Banco encontrado correctamente.',
    type: Bank,
  })
  @ApiBadRequestResponse({
    description: 'El identificador recibido no es un número entero válido.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró un banco con el identificador indicado.',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Bank> {
    return this.banksService.findOne(id);
  }

  /**
   * Modifica parcialmente un banco existente.
   *
   * PATCH /banks/:id
   */
  @ApiOperation({
    summary: 'Modificar un banco',
    description:
      'Modifica parcialmente el nombre o el porcentaje de comisión de un banco existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador numérico del banco.',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'El banco fue modificado correctamente.',
    type: Bank,
  })
  @ApiBadRequestResponse({
    description:
      'El identificador o los datos enviados no cumplen las validaciones.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró un banco con el identificador indicado.',
  })
  @ApiConflictResponse({
    description: 'Ya existe otro banco registrado con el mismo nombre.',
  })
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
  @ApiOperation({
    summary: 'Reactivar un banco',
    description:
      'Reactiva un banco que había sido desactivado mediante borrado lógico.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador numérico del banco.',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'El banco fue reactivado correctamente.',
    type: Bank,
  })
  @ApiBadRequestResponse({
    description: 'El identificador recibido no es un número entero válido.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró un banco con el identificador indicado.',
  })
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number): Promise<Bank> {
    return this.banksService.restore(id);
  }

  /**
   * Desactiva un banco mediante borrado lógico.
   *
   * DELETE /banks/:id
   */
  @ApiOperation({
    summary: 'Desactivar un banco',
    description:
      'Desactiva un banco mediante borrado lógico sin eliminar sus liquidaciones históricas.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador numérico del banco.',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'El banco fue desactivado correctamente.',
    type: Bank,
  })
  @ApiBadRequestResponse({
    description: 'El identificador recibido no es un número entero válido.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró un banco con el identificador indicado.',
  })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<Bank> {
    return this.banksService.remove(id);
  }
}
