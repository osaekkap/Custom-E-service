import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Request() req: { user: RequestUser }, @Query('search') search?: string) {
    return this.productsService.list(req.user.customerId, search);
  }

  @Get(':id')
  findOne(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(req.user.customerId, id);
  }

  @Post()
  create(@Request() req: { user: RequestUser }, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.customerId, dto);
  }

  @Patch(':id')
  update(
    @Request() req: { user: RequestUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(req.user.customerId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Request() req: { user: RequestUser }, @Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(req.user.customerId, id);
  }
}
