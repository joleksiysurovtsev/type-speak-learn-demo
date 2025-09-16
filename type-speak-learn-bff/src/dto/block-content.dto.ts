import { ApiProperty } from "@nestjs/swagger";
import type { BlockContent, ExerciseType, LocalizedText } from "../common/types";
import { EXERCISE_TYPES } from "../common/types";
import { ExerciseDto } from "./exercise.dto";
import { LocalizedTextDto } from "./localized.dto";

export class BlockContentDto {
  constructor(partial: BlockContent) {
    Object.assign(this, partial);
    this.exercises = partial.exercises?.map((exercise) => new ExerciseDto(exercise));
  }

  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: EXERCISE_TYPES })
  type!: ExerciseType;

  @ApiProperty({ type: LocalizedTextDto })
  title!: LocalizedText;

  @ApiProperty({ type: LocalizedTextDto })
  description!: LocalizedText;

  @ApiProperty({ type: [ExerciseDto] })
  exercises!: ExerciseDto[];
}
