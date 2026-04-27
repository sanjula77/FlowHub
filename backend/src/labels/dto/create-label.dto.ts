import { IsString, MaxLength, Matches } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @MaxLength(50, { message: 'Label name must not exceed 50 characters' })
  name: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color (e.g. #FF5733)',
  })
  color: string;
}
