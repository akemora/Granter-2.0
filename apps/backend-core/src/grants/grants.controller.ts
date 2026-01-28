import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GrantsService } from './grants.service';
import { CreateGrantDto } from './dto/create-grant.dto';
import { UpdateGrantDto } from './dto/update-grant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GrantEntity } from '../database/entities/grant.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { calculatePagination } from '../common/utils/pagination.utils';

@Controller('grants')
export class GrantsController {
  constructor(private readonly grantsService: GrantsService) {}

  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('region') region?: string,
    @Query('sector') sector?: string,
    @Query('status') status?: string,
  ): Promise<PaginatedResponse<GrantEntity>> {
    const filters = {
      ...(region && { region }),
      ...(sector && { sector }),
      ...(status && { status }),
    };

    const { skip, take } = calculatePagination(
      paginationDto.skip,
      paginationDto.take,
    );

    const data = await this.grantsService.findAll(filters, { skip, take });

    return new PaginatedResponse(
      data,
      data.length,
      skip,
      take,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GrantEntity> {
    return this.grantsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async create(@Body() createGrantDto: CreateGrantDto): Promise<GrantEntity> {
    return this.grantsService.create(createGrantDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateGrantDto: UpdateGrantDto,
  ): Promise<GrantEntity> {
    return this.grantsService.update(id, updateGrantDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    return this.grantsService.delete(id);
  }
}
