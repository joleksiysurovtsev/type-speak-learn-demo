import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type {
  Exercise,
  ExerciseType,
  LocalizedAlphabetLetters,
  LocalizedStrings,
  LocalizedText,
} from "../common/types";
import { EXERCISE_TYPES } from "../common/types";
import { LocalizedAlphabetLettersDto, LocalizedStringsDto, LocalizedTextDto } from "./localized.dto";

export class ExerciseDto {
  constructor(partial: Exercise) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: EXERCISE_TYPES })
  type!: ExerciseType;

  @ApiProperty({ type: LocalizedTextDto })
  title!: LocalizedText;

  @ApiProperty({ type: LocalizedTextDto })
  instructions!: LocalizedText;

  @ApiPropertyOptional({ type: LocalizedTextDto })
  successMessages?: LocalizedText;

  @ApiPropertyOptional({ type: LocalizedStringsDto })
  words?: LocalizedStrings;

  @ApiPropertyOptional({ type: LocalizedAlphabetLettersDto })
  letters?: LocalizedAlphabetLetters;
}
