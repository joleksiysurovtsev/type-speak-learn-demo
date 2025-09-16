import { Controller, Get, Param } from "@nestjs/common";
import { ApiExtraModels, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { BlocksService } from "./blocks.service";
import { BlockSummaryDto } from "../dto/block-summary.dto";
import { BlockContentDto } from "../dto/block-content.dto";
import { ExerciseDto } from "../dto/exercise.dto";
import { AlphabetLetterDto, LocalizedAlphabetLettersDto, LocalizedStringsDto, LocalizedTextDto } from "../dto/localized.dto";

@ApiTags("blocks")
@ApiExtraModels(
  BlockSummaryDto,
  BlockContentDto,
  ExerciseDto,
  LocalizedTextDto,
  LocalizedStringsDto,
  LocalizedAlphabetLettersDto,
  AlphabetLetterDto,
)
@Controller("api/blocks")
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  @ApiOkResponse({ type: BlockSummaryDto, isArray: true })
  async listBlocks(): Promise<BlockSummaryDto[]> {
    const summaries = await this.blocksService.getBlockSummaries();
    return summaries.map((summary) => new BlockSummaryDto(summary));
  }

  @Get(":id/content")
  @ApiParam({ name: "id", description: "Block identifier" })
  @ApiOkResponse({ type: BlockContentDto })
  @ApiNotFoundResponse({ description: "Block not found" })
  async getBlockContent(@Param("id") id: string): Promise<BlockContentDto> {
    const content = await this.blocksService.getBlockContent(id);
    return new BlockContentDto(content);
  }
}
