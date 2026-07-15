import { PartialType } from '@nestjs/mapped-types';

import { CreateGroupDto } from './create-group.dto';

/**
 * DTO utilizado para modificar un grupo existente.
 *
 * PartialType reutiliza las validaciones de CreateGroupDto,
 * pero convierte todos sus atributos en opcionales.
 */
export class UpdateGroupDto extends PartialType(CreateGroupDto) {}