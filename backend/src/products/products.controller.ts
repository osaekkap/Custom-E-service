import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUser } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  list(@Request() req: { user: RequestUser }, @Query('search') search?: string) {
    return this.productsService.list(req.user.customerId, search);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.MANAGER, Role.STAFF, Role.USER)
  findOne(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(req.user.customerId, id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  create(@Request() req: { user: RequestUser }, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.customerId, dto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.STAFF, Role.USER)
  update(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(req.user.customerId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
  remove(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(req.user.customerId, id);
  }
}
