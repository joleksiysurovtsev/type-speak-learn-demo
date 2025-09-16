import { Body, Controller, Post } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TtsPreviewRequestDto, TtsPreviewResponseDto } from "../dto/tts-preview.dto";
import { TtsService } from "./tts.service";

@ApiTags("tts")
@Controller("api/tts")
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post("preview")
  @ApiOkResponse({ type: TtsPreviewResponseDto })
  async preview(@Body() body: TtsPreviewRequestDto): Promise<TtsPreviewResponseDto> {
    return this.ttsService.preview(body);
  }
}
