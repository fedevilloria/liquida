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

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { GroupsService } from './groups.service';

/**
 * Agrupa los endpoints relacionados con la gestión de grupos
 * dentro de una misma sección de Swagger.
 */
@ApiTags('Groups')
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
  @ApiOperation({
    summary: 'Registrar un grupo',
    description:
      'Crea un nuevo grupo activo que podrá utilizarse en futuras liquidaciones.',
  })
  @ApiCreatedResponse({
    description: 'El grupo fue registrado correctamente.',
    type: Group,
  })
  @ApiBadRequestResponse({
    description: 'Los datos enviados no cumplen las validaciones.',
  })
  @ApiConflictResponse({
    description: 'Ya existe un grupo registrado con el mismo nombre.',
  })
  @Post()
  create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupsService.create(createGroupDto);
  }

  /**
   * Obtiene todos los grupos, incluyendo los inactivos.
   *
   * GET /groups
   */
  @ApiOperation({
    summary: 'Consultar todos los grupos',
    description:
      'Devuelve todos los grupos registrados, incluyendo los grupos inactivos.',
  })
  @ApiOkResponse({
    description: 'Listado de grupos obtenido correctamente.',
    type: Group,
    isArray: true,
  })
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
  @ApiOperation({
    summary: 'Consultar los grupos activos',
    description: 'Devuelve únicamente los grupos que se encuentran activos.',
  })
  @ApiOkResponse({
    description: 'Listado de grupos activos obtenido correctamente.',
    type: Group,
    isArray: true,
  })
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
  @ApiOperation({
    summary: 'Consultar un grupo por su identificador',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador numérico del grupo.',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Grupo encontrado correctamente.',
    type: Group,
  })
  @ApiBadRequestResponse({
    description: 'El identificador recibido no es un número entero válido.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró un grupo con el identificador indicado.',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Group> {
    return this.groupsService.findOne(id);
  }

  /**
   * Modifica parcialmente un grupo existente.
   *
   * PATCH /groups/:id
   */
  @ApiOperation({
    summary: 'Modificar un grupo',
    description: 'Modifica parcialmente los datos de un grupo existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador numérico del grupo.',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'El grupo fue modificado correctamente.',
    type: Group,
  })
  @ApiBadRequestResponse({
    description:
      'El identificador o los datos enviados no cumplen las validaciones.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró un grupo con el identificador indicado.',
  })
  @ApiConflictResponse({
    description: 'Ya existe otro grupo registrado con el mismo nombre.',
  })
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
   * PATCH /groups/:id/restore
   */
  @ApiOperation({
    summary: 'Reactivar un grupo',
    description:
      'Reactiva un grupo que había sido desactivado mediante borrado lógico.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador numérico del grupo.',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'El grupo fue reactivado correctamente.',
    type: Group,
  })
  @ApiBadRequestResponse({
    description: 'El identificador recibido no es un número entero válido.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró un grupo con el identificador indicado.',
  })
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number): Promise<Group> {
    return this.groupsService.restore(id);
  }

  /**
   * Desactiva un grupo mediante borrado lógico.
   *
   * DELETE /groups/:id
   */
  @ApiOperation({
    summary: 'Desactivar un grupo',
    description:
      'Desactiva un grupo mediante borrado lógico sin eliminar su información histórica.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador numérico del grupo.',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'El grupo fue desactivado correctamente.',
    type: Group,
  })
  @ApiBadRequestResponse({
    description: 'El identificador recibido no es un número entero válido.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró un grupo con el identificador indicado.',
  })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<Group> {
    return this.groupsService.remove(id);
  }
}
