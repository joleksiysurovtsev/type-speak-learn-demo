import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { isAxiosError } from "axios";
import { TtsPreviewRequestDto, TtsPreviewResponseDto } from "../dto/tts-preview.dto";

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async preview(request: TtsPreviewRequestDto): Promise<TtsPreviewResponseDto> {
    if (!this.isRemoteAvailable()) {
      return this.buildMockResponse(request, "Remote service URL is not configured");
    }

    try {
      const response = await this.httpService.axiosRef.post<TtsPreviewResponseDto>(
        "/tts/preview",
        request,
      );
      return response.data;
    } catch (error) {
      this.logger.warn(`Falling back to mock TTS preview: ${this.describeError(error)}`);
      return this.buildMockResponse(request, "Temporary fallback response while TTS is unavailable");
    }
  }

  private isRemoteAvailable(): boolean {
    return Boolean(this.configService.get<string>("KOTLIN_SERVICE_URL"));
  }

  private describeError(error: unknown): string {
    if (isAxiosError(error)) {
      return `status=${error.response?.status ?? "unknown"}`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "unknown error";
  }

  private buildMockResponse(request: TtsPreviewRequestDto, note: string): TtsPreviewResponseDto {
    return new TtsPreviewResponseDto({
      text: request.text,
      language: request.language,
      audioUrl: null,
      provider: "mock",
      note,
    });
  }
}
