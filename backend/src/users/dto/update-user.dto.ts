import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { UserRole } from '../user.entity';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsOptional()
  email?: string;

  @IsEnum(UserRole, { message: 'Role must be either USER or ADMIN' })
  @IsOptional()
  role?: UserRole;

  @IsString()
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message:
      'First name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @IsOptional()
  firstName?: string;

  @IsString()
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message:
      'Last name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @IsOptional()
  lastName?: string;
}
