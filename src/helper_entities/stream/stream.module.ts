import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { Stream } from './stream.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stream])],
  providers: [StreamService],
  controllers: [StreamController],
  exports: [TypeOrmModule],
})
export class StreamModule {}
