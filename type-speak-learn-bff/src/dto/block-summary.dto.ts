import { ApiProperty } from "@nestjs/swagger";
import type { BlockSummary, ExerciseType, LocalizedText } from "../common/types";
import { EXERCISE_TYPES } from "../common/types";
import { LocalizedTextDto } from "./localized.dto";

export class BlockSummaryDto {
  constructor(partial: BlockSummary) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: EXERCISE_TYPES })
  type!: ExerciseType;

  @ApiProperty({ type: LocalizedTextDto })
  title!: LocalizedText;

  @ApiProperty({ type: LocalizedTextDto })
  description!: LocalizedText;

  @ApiProperty()
  unlocked!: boolean;

  @ApiProperty({ minimum: 0, maximum: 1 })
  progress!: number;
}
