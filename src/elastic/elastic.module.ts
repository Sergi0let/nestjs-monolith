import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticController } from './elastic.controller';
import { ElasticService } from './elastic.service';

@Global()
@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_URL'),
        requestTimeout: 30000,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ElasticController],
  providers: [ElasticService],
  exports: [ElasticService],
})
export class ElasticModule {}
