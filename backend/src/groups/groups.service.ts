import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService {
  /**
   * Inyecta el repositorio de Group para acceder
   * a las operaciones de persistencia de TypeORM.
   */
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
  ) {}

  /**
   * Registra un nuevo grupo.
   *
   * Antes de guardar, verifica que no exista otro grupo
   * con el mismo nombre, independientemente de mayúsculas
   * y minúsculas.
   */
  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    await this.validateUniqueName(createGroupDto.name);

    const group = this.groupsRepository.create({
      name: createGroupDto.name,
    });

    return this.groupsRepository.save(group);
  }

  /**
   * Obtiene todos los grupos registrados.
   *
   * Se incluyen tanto los grupos activos como los inactivos,
   * permitiendo que la pantalla administrativa muestre
   * el estado completo de los registros.
   */
  async findAll(): Promise<Group[]> {
    return this.groupsRepository.find({
      order: {
        active: 'DESC',
        name: 'ASC',
      },
    });
  }

  /**
   * Obtiene únicamente los grupos activos.
   *
   * Este método será utilizado posteriormente para cargar
   * el desplegable de grupos en la calculadora de comisiones.
   */
  async findAllActive(): Promise<Group[]> {
    return this.groupsRepository.find({
      where: {
        active: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  /**
   * Busca un grupo mediante su identificador.
   *
   * Si el registro no existe, devuelve una respuesta HTTP 404
   * en lugar de continuar trabajando con un valor indefinido.
   */
  async findOne(id: number): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: {
        id,
      },
    });

    if (!group) {
      throw new NotFoundException(`No se encontró el grupo con ID ${id}.`);
    }

    return group;
  }

  /**
   * Modifica los datos de un grupo existente.
   *
   * Si se modifica el nombre, se valida que el nuevo valor
   * no esté siendo utilizado por otro registro.
   */
  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);

    if (
      updateGroupDto.name !== undefined &&
      updateGroupDto.name !== group.name
    ) {
      await this.validateUniqueName(updateGroupDto.name, id);
    }

    this.groupsRepository.merge(group, updateGroupDto);

    return this.groupsRepository.save(group);
  }

  /**
   * Desactiva un grupo mediante borrado lógico.
   *
   * No se elimina físicamente el registro porque podría tener
   * cálculos históricos asociados que deben conservarse.
   */
  async remove(id: number): Promise<Group> {
    const group = await this.findOne(id);

    group.active = false;

    return this.groupsRepository.save(group);
  }

  /**
   * Reactiva un grupo que había sido desactivado.
   *
   * Esto permite que vuelva a aparecer en los desplegables
   * sin tener que crear un nuevo registro.
   */
  async restore(id: number): Promise<Group> {
    const group = await this.findOne(id);

    group.active = true;

    return this.groupsRepository.save(group);
  }

  /**
   * Verifica que el nombre no esté asignado a otro grupo.
   *
   * ILike permite realizar una comparación sin distinguir
   * entre mayúsculas y minúsculas en PostgreSQL.
   *
   * El parámetro excludedId se utiliza durante una modificación
   * para evitar comparar el registro consigo mismo.
   */
  private async validateUniqueName(
    name: string,
    excludedId?: number,
  ): Promise<void> {
    const existingGroup = await this.groupsRepository.findOne({
      where: {
        name: ILike(name),
      },
    });

    if (existingGroup && existingGroup.id !== excludedId) {
      throw new ConflictException(
        `Ya existe un grupo registrado con el nombre "${name}".`,
      );
    }
  }
}
