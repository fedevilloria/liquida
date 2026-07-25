import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { BanksService } from '../banks/banks.service';
import { GroupsService } from '../groups/groups.service';
import { RegisterCommissionCalculationDto } from './dto/register-commission-calculation.dto';
import { CommissionCalculation } from './entities/commission-calculation.entity';
import { FindCommissionCalculationsDto } from './dto/find-commission-calculations.dto';
import { DashboardFiltersDto } from './dto/dashboard-filters.dto';
import { CommissionDashboardResponseDto } from './dto/commission-dashboard-response.dto';
import { PaginatedCommissionCalculationResponseDto } from './dto/paginated-commission-calculation-response.dto';
import { CommissionCalculationResponseDto } from './dto/commission-calculation-response.dto';

/**
 * Estructura mínima necesaria para aplicar filtros por rango de fechas.
 *
 * La utilizan tanto el historial como el dashboard, evitando
 * que el método auxiliar dependa de un DTO específico.
 */
interface DateRangeFilters {
  from?: string;
  to?: string;
}

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
  ): Promise<CommissionCalculationResponseDto> {
    const group = await this.groupsService.findOne(registerDto.groupId);

    // Un grupo inactivo no puede utilizarse para registrar
    // nuevas liquidaciones, aunque siga existiendo en el historial.
    if (!group.active) {
      throw new BadRequestException(
        `El grupo "${group.name}" se encuentra inactivo.`,
      );
    }

    const bank = await this.banksService.findOne(registerDto.bankId);

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

    // Construye la entidad en memoria.
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

    // Persiste la entidad en la base de datos.
    const savedCalculation =
      await this.commissionCalculationsRepository.save(calculation);

    // Devuelve el DTO de respuesta.
    return CommissionCalculationResponseDto.fromEntity(
      savedCalculation,
    );
  }

  /**
   * Obtiene el historial de liquidaciones.
   *
   * Los filtros son opcionales y pueden combinarse.
   * Si no se recibe ninguno, devuelve la primera página
   * ordenada según los parámetros recibidos.
   */
  async findAll(
    filters: FindCommissionCalculationsDto,
  ): Promise<PaginatedCommissionCalculationResponseDto> {
    // Se construye una consulta dinámica porque los filtros
    // dependen de los parámetros enviados por el usuario.
    const query = this.commissionCalculationsRepository
      .createQueryBuilder('calculation')
      .leftJoinAndSelect('calculation.group', 'group')
      .leftJoinAndSelect('calculation.bank', 'bank');

    // Aplica el filtro por grupo únicamente cuando el parámetro fue enviado.
    if (filters.groupId !== undefined) {
      query.andWhere('group.id = :groupId', {
        groupId: filters.groupId,
      });
    }

    // Aplica el filtro por banco únicamente cuando el parámetro fue enviado.
    if (filters.bankId !== undefined) {
      query.andWhere('bank.id = :bankId', {
        bankId: filters.bankId,
      });
    }

    // Valida que el período tenga un orden temporal correcto antes de ejecutar la consulta en PostgreSQL.
    if (
      filters.from !== undefined &&
      filters.to !== undefined &&
      filters.from > filters.to
    ) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    // Página solicitada.
    const page = filters.page;

    // Cantidad máxima de registros por página.
    const limit = filters.limit;

    // Cantidad de registros que deben omitirse
    // antes de comenzar a devolver resultados.
    const skip = (page - 1) * limit;

    // Reutiliza la misma lógica temporal empleada por las consultas del dashboard.
    this.applyDateFilters(query, filters);

    // Ordena el historial según los parámetros enviados.
    query.orderBy(
      `calculation.${filters.sortBy}`,
      filters.sortOrder
    );

    // Aplica la paginación.
    query.skip(skip).take(limit);

    // Obtiene los registros de la página solicitada
    // y la cantidad total de registros que cumplen los filtros.
    const [calculations, totalItems] =
      await query.getManyAndCount();

    // Calcula la cantidad total de páginas disponibles.
    const totalPages = Math.ceil(totalItems / limit);

    // Convierte las entidades obtenidas desde PostgreSQL
    // al formato público utilizado por la API.
    const data: CommissionCalculationResponseDto[] =
      calculations.map((calculation) =>
        CommissionCalculationResponseDto.fromEntity(calculation),
      );

    // Construye la respuesta con los registros obtenidos
    // y los metadatos necesarios para navegar entre páginas.
    return {
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  }

  /**
   * Busca una liquidación mediante su identificador.
   *
   * Si no existe, devuelve una respuesta HTTP 404.
   */
  async findOne(id: number): Promise<CommissionCalculationResponseDto> {
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

    return CommissionCalculationResponseDto.fromEntity(
      calculation,
    );
  }

  /**
   * Obtiene las estadísticas generales del dashboard.
  *
   * Permite limitar los resultados a un período determinado.
   */
  async getDashboard(
    filters: DashboardFiltersDto,
  ): Promise<CommissionDashboardResponseDto> {
    // Se valida que el período tenga un orden cronológico correcto
    // antes de ejecutar la consulta en la base de datos.
    if (
      filters.from !== undefined &&
      filters.to !== undefined &&
      filters.from > filters.to
    ) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    // Se construye una consulta agregada.
    //
    // A diferencia del historial, esta consulta no devuelve
    // entidades individuales, sino una única fila con totales,
    // cantidad de registros y promedio.
    const query = this.commissionCalculationsRepository
      .createQueryBuilder('calculation')
      .select(
        'COUNT(calculation.id)',
        'calculationCount',
      )
      .addSelect(
        'COALESCE(SUM(calculation.collectionAmount), 0)',
        'totalCollectionAmount',
      )
      .addSelect(
        'COALESCE(SUM(calculation.totalCommissionAmount), 0)',
        'totalCommissionAmount',
      )
      .addSelect(
        'COALESCE(SUM(calculation.bankCommissionAmount), 0)',
        'bankCommissionAmount',
      )
      .addSelect(
        'COALESCE(SUM(calculation.clientCommissionAmount), 0)',
        'clientCommissionAmount',
      )
      .addSelect(
        'COALESCE(SUM(calculation.ownCommissionAmount), 0)',
        'ownCommissionAmount',
      )
      .addSelect(
        'COALESCE(AVG(calculation.collectionAmount), 0)',
        'averageCollectionAmount',
      );

    this.applyDateFilters(query, filters);

    // getRawOne() se utiliza porque la consulta devuelve
    // columnas calculadas y no una entidad CommissionCalculation.
    const result = await query.getRawOne<{
      calculationCount: string;
      totalCollectionAmount: string;
      totalCommissionAmount: string;
      bankCommissionAmount: string;
      clientCommissionAmount: string;
      ownCommissionAmount: string;
      averageCollectionAmount: string;
    }>();

    // Se agrupan las liquidaciones por grupo y se suma
    // la recaudación acumulada de cada uno.
    //
    // El orden descendente permite obtener primero
    // al grupo con mayor recaudación.
    const topGroupQuery = this.commissionCalculationsRepository
      .createQueryBuilder('calculation')
      .innerJoin('calculation.group', 'group')
      .select('group.id', 'id')
      .addSelect('group.name', 'name')
      .addSelect(
        'SUM(calculation.collectionAmount)',
        'totalCollectionAmount',
      )
      .groupBy('group.id')
      .addGroupBy('group.name')
      .orderBy(
        'SUM(calculation.collectionAmount)',
        'DESC',
      )
      .limit(1);

    this.applyDateFilters(topGroupQuery, filters);

    const topGroupResult = await topGroupQuery.getRawOne<{
      id: string;
      name: string;
      totalCollectionAmount: string;
    }>();

    // Se agrupan las liquidaciones por banco y se cuenta
    // cuántas veces fue utilizado cada uno.
    //
    // El primer resultado será el banco utilizado
    // en la mayor cantidad de liquidaciones.
    const topBankQuery = this.commissionCalculationsRepository
      .createQueryBuilder('calculation')
      .innerJoin('calculation.bank', 'bank')
      .select('bank.id', 'id')
      .addSelect('bank.name', 'name')
      .addSelect(
        'COUNT(calculation.id)',
        'calculationCount',
      )
      .groupBy('bank.id')
      .addGroupBy('bank.name')
      .orderBy(
        'COUNT(calculation.id)',
        'DESC',
      )
      .limit(1);

    this.applyDateFilters(topBankQuery, filters);

    const topBankResult = await topBankQuery.getRawOne<{
      id: string;
      name: string;
      calculationCount: string;
    }>();

    return {
      from: filters.from ?? null,
      to: filters.to ?? null,

      // PostgreSQL devuelve COUNT, SUM y AVG como texto en este tipo
      // de consulta, por lo que se convierten explícitamente a number.
      calculationCount: Number(
        result?.calculationCount ?? 0,
      ),

      totalCollectionAmount: this.roundToTwoDecimals(
        Number(result?.totalCollectionAmount ?? 0),
      ),

      totalCommissionAmount: this.roundToTwoDecimals(
        Number(result?.totalCommissionAmount ?? 0),
      ),

      bankCommissionAmount: this.roundToTwoDecimals(
        Number(result?.bankCommissionAmount ?? 0),
      ),

      clientCommissionAmount: this.roundToTwoDecimals(
        Number(result?.clientCommissionAmount ?? 0),
      ),

      ownCommissionAmount: this.roundToTwoDecimals(
        Number(result?.ownCommissionAmount ?? 0),
      ),

      averageCollectionAmount: this.roundToTwoDecimals(
        Number(result?.averageCollectionAmount ?? 0),
      ),

      topGroup: topGroupResult
        ? {
            id: Number(topGroupResult.id),
            name: topGroupResult.name,
            totalCollectionAmount: this.roundToTwoDecimals(
              Number(topGroupResult.totalCollectionAmount),
            ),
          }
        : null,

      topBank: topBankResult
        ? {
            id: Number(topBankResult.id),
            name: topBankResult.name,
            calculationCount: Number(
              topBankResult.calculationCount,
            ),
          }
        : null,
    };
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
  /**
   * Aplica los filtros de fechas a una consulta.
   *
   * Este método permite reutilizar la misma lógica
   * en las distintas consultas del dashboard,
   * evitando duplicar código.
   */
  private applyDateFilters(
    query: SelectQueryBuilder<CommissionCalculation>,
    filters: DateRangeFilters,
  ): void {
    // Incluye las liquidaciones desde el inicio
    // completo del día indicado.
    if (filters.from !== undefined) {
      query.andWhere(
        'calculation.calculationDateTime >= :fromDateTime',
        {
          fromDateTime: `${filters.from} 00:00:00.000`,
        },
      );
    }

    // Incluye las liquidaciones hasta el final
    // completo del día indicado.
    if (filters.to !== undefined) {
      query.andWhere(
        'calculation.calculationDateTime <= :toDateTime',
        {
          toDateTime: `${filters.to} 23:59:59.999`,
        },
      );
    }
  }
}