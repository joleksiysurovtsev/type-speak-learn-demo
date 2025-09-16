import { HttpService } from "@nestjs/axios";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosError, isAxiosError } from "axios";
import type { BlockContent, BlockSummary } from "../common/types";
import blocksMock from "../mocks/blocks.json";

interface BlocksMockData {
  summaries: BlockSummary[];
  content: Record<string, BlockContent>;
}

const MOCK_DATA = blocksMock as BlocksMockData;

@Injectable()
export class BlocksService {
  private readonly logger = new Logger(BlocksService.name);
  private readonly remoteAvailable: boolean;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.remoteAvailable = Boolean(this.configService.get<string>("KOTLIN_SERVICE_URL"));
  }

  async getBlockSummaries(): Promise<BlockSummary[]> {
    const remote = await this.tryFetch<BlockSummary[]>("/blocks");
    if (remote?.length) {
      return remote;
    }

    return MOCK_DATA.summaries.map((summary) => ({ ...summary }));
  }

  async getBlockContent(id: string): Promise<BlockContent> {
    const remote = await this.tryFetch<BlockContent>(`/blocks/${id}/content`);
    if (remote) {
      return remote;
    }

    const fallback = MOCK_DATA.content[id];
    if (!fallback) {
      throw new NotFoundException(`Block ${id} not found`);
    }

    return JSON.parse(JSON.stringify(fallback));
  }

  private async tryFetch<T>(path: string): Promise<T | undefined> {
    if (!this.remoteAvailable) {
      return undefined;
    }

    try {
      const response = await this.httpService.axiosRef.get<T>(path);
      return response.data;
    } catch (error) {
      this.logger.warn(`Falling back to mock for ${path}: ${this.describeAxiosError(error)}`);
      return undefined;
    }
  }

  private describeAxiosError(error: unknown): string {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const statusText = axiosError.response?.statusText;
      const message = axiosError.message;
      return `status=${status ?? "unknown"} ${statusText ?? ""} message=${message}`.trim();
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "unknown error";
  }
}
