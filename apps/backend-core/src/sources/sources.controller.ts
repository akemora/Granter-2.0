import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { XServiceTokenGuard } from '../common/guards/x-service-token.guard';
import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { SourceEntity } from '../database/entities/source.entity';

@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get()
  async findAll(@Query('active') active?: string, @Query('region') region?: string): Promise<SourceEntity[]> {
    const activeFilter = this.parseBoolean(active);
    return this.sourcesService.findAll({
      active: activeFilter,
      region,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SourceEntity> {
    return this.sourcesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async create(@Body() dto: CreateSourceDto): Promise<SourceEntity> {
    return this.sourcesService.create(dto);
  }

  @Post('service')
  @UseGuards(XServiceTokenGuard)
  @HttpCode(201)
  async createFromService(@Body() dto: CreateSourceDto): Promise<SourceEntity> {
    return this.sourcesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateSourceDto): Promise<SourceEntity> {
    return this.sourcesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.sourcesService.delete(id);
  }

  private parseBoolean(value?: string): boolean | undefined {
    if (value === undefined) {
      return undefined;
    }
    return value === 'true' || value === '1';
  }
}
