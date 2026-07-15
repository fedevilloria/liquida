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

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  /**
   * Inyecta el servicio que contiene la lógica
   * correspondiente a la gestión de grupos.
   */
  constructor(private readonly groupsService: GroupsService) {}

  /**
   * Registra un nuevo grupo.
   *
   * POST /groups
   */
  @Post()
  create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupsService.create(createGroupDto);
  }

  /**
   * Obtiene todos los grupos, incluyendo los inactivos.
   *
   * GET /groups
   */
  @Get()
  findAll(): Promise<Group[]> {
    return this.groupsService.findAll();
  }

  /**
   * Obtiene únicamente los grupos activos.
   *
   * Esta ruta será utilizada por el desplegable
   * de la calculadora de comisiones.
   *
   * GET /groups/active
   */
  @Get('active')
  findAllActive(): Promise<Group[]> {
    return this.groupsService.findAllActive();
  }

  /**
   * Obtiene un grupo mediante su identificador.
   *
   * ParseIntPipe convierte el parámetro recibido
   * desde la URL en un número entero.
   *
   * GET /groups/:id
   */
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Group> {
    return this.groupsService.findOne(id);
  }

  /**
   * Modifica parcialmente un grupo existente.
   *
   * PATCH /groups/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupsService.update(id, updateGroupDto);
  }

  /**
   * Reactiva un grupo previamente desactivado.
   *
   * Esta ruta debe declararse antes de otras rutas dinámicas
   * cuando puedan producirse conflictos en la resolución.
   *
   * PATCH /groups/:id/restore
   */
  @Patch(':id/restore')
  restore(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Group> {
    return this.groupsService.restore(id);
  }

  /**
   * Desactiva un grupo mediante borrado lógico.
   *
   * DELETE /groups/:id
   */
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Group> {
    return this.groupsService.remove(id);
  }
}