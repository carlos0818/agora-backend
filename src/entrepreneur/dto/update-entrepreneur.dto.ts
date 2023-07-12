import { PartialType } from '@nestjs/swagger';
import { CreateEntrepreneurDto } from './create-entrepreneur.dto';

export class UpdateEntrepreneurDto extends PartialType(CreateEntrepreneurDto) {}
