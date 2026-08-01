import { PartialType } from '@nestjs/swagger';

import { CreateGroupDto } from './create-group.dto';

/**
 * DTO utilizado para modificar un grupo existente.
 *
 * PartialType reutiliza las validaciones y la documentación
 * de CreateGroupDto, pero convierte todos sus atributos
 * en opcionales.
 */
export class UpdateGroupDto extends PartialType(CreateGroupDto) {}
