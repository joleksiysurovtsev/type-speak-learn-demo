import { ApiProperty } from "@nestjs/swagger";
import type { LocalizedAlphabetLetters, LocalizedStrings, LocalizedText } from "../common/types";
import { LANGUAGE_CODES } from "../common/types";
import type { AlphabetLetter } from "../common/types";

export class LocalizedTextDto implements LocalizedText {
  @ApiProperty({ required: false })
  uk?: string;

  @ApiProperty({ required: false })
  en?: string;

  @ApiProperty({ required: false })
  ru?: string;

  @ApiProperty({ required: false })
  pl?: string;
}

export class LocalizedStringsDto implements LocalizedStrings {
  @ApiProperty({ required: false, type: [String] })
  uk?: string[];

  @ApiProperty({ required: false, type: [String] })
  en?: string[];

  @ApiProperty({ required: false, type: [String] })
  ru?: string[];

  @ApiProperty({ required: false, type: [String] })
  pl?: string[];
}

export class AlphabetLetterDto implements AlphabetLetter {
  @ApiProperty()
  letter!: string;

  @ApiProperty({ required: false })
  uppercase?: string;

  @ApiProperty({ required: false })
  lowercase?: string;

  @ApiProperty({ required: false })
  transliteration?: string;

  @ApiProperty({ required: false })
  audioUrl?: string;
}

export class LocalizedAlphabetLettersDto implements LocalizedAlphabetLetters {
  @ApiProperty({ required: false, type: [AlphabetLetterDto] })
  uk?: AlphabetLetterDto[];

  @ApiProperty({ required: false, type: [AlphabetLetterDto] })
  en?: AlphabetLetterDto[];

  @ApiProperty({ required: false, type: [AlphabetLetterDto] })
  ru?: AlphabetLetterDto[];

  @ApiProperty({ required: false, type: [AlphabetLetterDto] })
  pl?: AlphabetLetterDto[];
}

export const LANGUAGE_CODES_ENUM = [...LANGUAGE_CODES];
