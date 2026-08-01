import { PartialType } from '@nestjs/swagger';

import { CreateBankDto } from './create-bank.dto';

/**
 * DTO utilizado para modificar un banco existente.
 *
 * PartialType reutiliza las validaciones y la documentación
 * del DTO de creación, pero convierte todos sus atributos
 * en opcionales.
 */
export class UpdateBankDto extends PartialType(CreateBankDto) {}
