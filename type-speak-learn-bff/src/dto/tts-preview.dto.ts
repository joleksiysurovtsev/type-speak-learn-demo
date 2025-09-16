import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { LANGUAGE_CODES_ENUM } from "./localized.dto";
import type { LanguageCode } from "../common/types";

export class TtsPreviewRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text!: string;

  @ApiProperty({ enum: LANGUAGE_CODES_ENUM })
  @IsIn(LANGUAGE_CODES_ENUM)
  language!: LanguageCode;
}

export class TtsPreviewResponseDto {
  constructor(partial: TtsPreviewResponseDto) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  text!: string;

  @ApiProperty({ enum: LANGUAGE_CODES_ENUM })
  language!: LanguageCode;

  @ApiProperty({ required: false })
  audioUrl?: string | null;

  @ApiProperty()
  provider!: string;

  @ApiProperty({ required: false })
  note?: string;
}
