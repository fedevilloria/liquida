import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Bank } from './entities/bank.entity';

@Injectable()
export class BanksService {
  /**
   * Inyecta el repositorio de Bank para acceder
   * a las operaciones de persistencia de TypeORM.
   */
  constructor(
    @InjectRepository(Bank)
    private readonly banksRepository: Repository<Bank>,
  ) {}

  /**
   * Registra un nuevo banco o medio de cobro.
   *
   * Antes de guardar, valida que no exista otro registro
   * con el mismo nombre, sin distinguir mayúsculas y minúsculas.
   */
  async create(createBankDto: CreateBankDto): Promise<Bank> {
    await this.validateUniqueName(createBankDto.name);

    const bank = this.banksRepository.create(createBankDto);

    return this.banksRepository.save(bank);
  }

  /**
   * Obtiene todos los bancos registrados,
   * incluyendo los activos y los inactivos.
   */
  async findAll(): Promise<Bank[]> {
    return this.banksRepository.find({
      order: {
        active: 'DESC',
        name: 'ASC',
      },
    });
  }

  /**
   * Obtiene únicamente los bancos activos.
   *
   * Este método se utilizará para completar el desplegable
   * de bancos dentro de la calculadora de comisiones.
   */
  async findAllActive(): Promise<Bank[]> {
    return this.banksRepository.find({
      where: {
        active: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  /**
   * Busca un banco mediante su identificador.
   *
   * Si no existe, devuelve una respuesta HTTP 404.
   */
  async findOne(id: number): Promise<Bank> {
    const bank = await this.banksRepository.findOne({
      where: {
        id,
      },
    });

    if (!bank) {
      throw new NotFoundException(`No se encontró el banco con ID ${id}.`);
    }

    return bank;
  }

  /**
   * Modifica parcialmente un banco existente.
   *
   * Si se cambia el nombre, valida que no esté siendo
   * utilizado por otro registro.
   */
  async update(id: number, updateBankDto: UpdateBankDto): Promise<Bank> {
    const bank = await this.findOne(id);

    if (updateBankDto.name !== undefined && updateBankDto.name !== bank.name) {
      await this.validateUniqueName(updateBankDto.name, id);
    }

    this.banksRepository.merge(bank, updateBankDto);

    return this.banksRepository.save(bank);
  }

  /**
   * Desactiva el banco mediante borrado lógico.
   *
   * El registro permanece en la base para conservar
   * los cálculos históricos que puedan estar asociados.
   */
  async remove(id: number): Promise<Bank> {
    const bank = await this.findOne(id);

    bank.active = false;

    return this.banksRepository.save(bank);
  }

  /**
   * Reactiva un banco previamente desactivado.
   *
   * Al reactivarlo vuelve a estar disponible
   * en los desplegables del sistema.
   */
  async restore(id: number): Promise<Bank> {
    const bank = await this.findOne(id);

    bank.active = true;

    return this.banksRepository.save(bank);
  }

  /**
   * Verifica que no exista otro banco con el mismo nombre.
   *
   * ILike realiza la comparación sin distinguir
   * entre mayúsculas y minúsculas.
   */
  private async validateUniqueName(
    name: string,
    excludedId?: number,
  ): Promise<void> {
    const existingBank = await this.banksRepository.findOne({
      where: {
        name: ILike(name),
      },
    });

    if (existingBank && existingBank.id !== excludedId) {
      throw new ConflictException(
        `Ya existe un banco registrado con el nombre "${name}".`,
      );
    }
  }
}
