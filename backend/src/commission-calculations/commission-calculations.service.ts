import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BanksService } from '../banks/banks.service';
import { GroupsService } from '../groups/groups.service';
import { RegisterCommissionCalculationDto } from './dto/register-commission-calculation.dto';
import { CommissionCalculation } from './entities/commission-calculation.entity';

@Injectable()
export class CommissionCalculationsService {
  /**
   * Inyecta el repositorio de liquidaciones y los servicios
   * necesarios para consultar grupos y bancos.
   */
  constructor(
    @InjectRepository(CommissionCalculation)
    private readonly commissionCalculationsRepository: Repository<CommissionCalculation>,

    private readonly groupsService: GroupsService,

    private readonly banksService: BanksService,
  ) {}

  /**
   * Registra una nueva liquidación individual.
   *
   * El usuario proporciona los datos principales y el sistema
   * calcula automáticamente todos los porcentajes e importes
   * derivados antes de guardar el registro.
   */
  async registerCalculation(
    registerDto: RegisterCommissionCalculationDto,
  ): Promise<CommissionCalculation> {
    const group = await this.groupsService.findOne(registerDto.groupId);

    const bank = await this.banksService.findOne(registerDto.bankId);

    // Un grupo inactivo no puede utilizarse para registrar
    // nuevas liquidaciones, aunque siga existiendo en el historial.
    if (!group.active) {
      throw new BadRequestException(
        `El grupo "${group.name}" se encuentra inactivo.`,
      );
    }

    // Un banco inactivo tampoco debe estar disponible
    // para registrar nuevas liquidaciones.
    if (!bank.active) {
      throw new BadRequestException(
        `El banco "${bank.name}" se encuentra inactivo.`,
      );
    }

    const bankCommissionPercentage = Number(bank.commissionPercentage);

    // Cuando el usuario no informa comisión del cliente,
    // se utiliza cero exclusivamente para realizar las operaciones.
    const clientCommissionPercentage =
      registerDto.clientCommissionPercentage ?? 0;

    const ownCommissionPercentage =
      registerDto.totalCommissionPercentage -
      bankCommissionPercentage -
      clientCommissionPercentage;

    // La suma de las comisiones externas nunca puede superar
    // el porcentaje total cobrado sobre la recaudación.
    if (ownCommissionPercentage < 0) {
      throw new BadRequestException(
        'La suma de la comisión del banco y la comisión del cliente no puede superar la comisión total.',
      );
    }

    const totalCommissionAmount = this.calculatePercentageAmount(
      registerDto.collectionAmount,
      registerDto.totalCommissionPercentage,
    );

    const bankCommissionAmount = this.calculatePercentageAmount(
      registerDto.collectionAmount,
      bankCommissionPercentage,
    );

    const clientCommissionAmount =
      registerDto.clientCommissionPercentage === undefined
        ? null
        : this.calculatePercentageAmount(
            registerDto.collectionAmount,
            clientCommissionPercentage,
          );

    const ownCommissionAmount = this.calculatePercentageAmount(
      registerDto.collectionAmount,
      ownCommissionPercentage,
    );

    const calculation =
      this.commissionCalculationsRepository.create({
        collectionAmount: registerDto.collectionAmount,

        totalCommissionPercentage:
          registerDto.totalCommissionPercentage,

        bankCommissionPercentage,

        // Se guarda null cuando la liquidación no incluye
        // una comisión destinada al cliente.
        clientCommissionPercentage:
          registerDto.clientCommissionPercentage ?? null,

        ownCommissionPercentage:
          this.roundToTwoDecimals(ownCommissionPercentage),

        totalCommissionAmount,
        bankCommissionAmount,
        clientCommissionAmount,
        ownCommissionAmount,

        calculationDateTime:
          registerDto.calculationDateTime,

        notes: registerDto.notes ?? null,

        group,
        bank,
      });

    return this.commissionCalculationsRepository.save(calculation);
  }

  /**
   * Obtiene todas las liquidaciones registradas.
   *
   * Se incluyen las relaciones con grupo y banco para que
   * el historial pueda mostrar sus nombres directamente.
   */
  async findAll(): Promise<CommissionCalculation[]> {
    return this.commissionCalculationsRepository.find({
      relations: {
        group: true,
        bank: true,
      },
      order: {
        calculationDateTime: 'DESC',
      },
    });
  }

  /**
   * Busca una liquidación mediante su identificador.
   *
   * Si no existe, devuelve una respuesta HTTP 404.
   */
  async findOne(id: number): Promise<CommissionCalculation> {
    const calculation =
      await this.commissionCalculationsRepository.findOne({
        where: {
          id,
        },
        relations: {
          group: true,
          bank: true,
        },
      });

    if (!calculation) {
      throw new NotFoundException(
        `No se encontró la liquidación con ID ${id}.`,
      );
    }

    return calculation;
  }

  /**
   * Calcula el importe correspondiente a un porcentaje
   * y devuelve el resultado redondeado a dos decimales.
   */
  private calculatePercentageAmount(
    amount: number,
    percentage: number,
  ): number {
    return this.roundToTwoDecimals(
      (amount * percentage) / 100,
    );
  }

  /**
   * Redondea valores monetarios y porcentajes a dos decimales.
   *
   * Number.EPSILON ayuda a reducir errores frecuentes
   * provocados por la representación binaria de los decimales
   * en JavaScript.
   */
  private roundToTwoDecimals(value: number): number {
    return (
      Math.round((value + Number.EPSILON) * 100) / 100
    );
  }
}