import { Module } from "@nestjs/common";
import { BlocksController } from "./blocks.controller";
import { BlocksService } from "./blocks.service";
import { KotlinHttpModule } from "../http/kotlin-http.module";

@Module({
  imports: [KotlinHttpModule],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}
