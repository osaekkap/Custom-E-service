import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, ParseUUIDPipe,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  /** POST /customers — สร้างลูกค้าใหม่ (SUPER_ADMIN only) */
  @Roles(Role.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  /** GET /customers — รายการลูกค้าทั้งหมด (SUPER_ADMIN only) */
  @Roles(Role.SUPER_ADMIN)
  @Get()
  findAll(@Query() query: QueryCustomerDto) {
    return this.customerService.findAll(query);
  }

  /** GET /customers/:id — ดูรายละเอียดลูกค้า (SUPER_ADMIN only) */
  @Roles(Role.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.findOne(id);
  }

  /** PATCH /customers/:id — แก้ไขข้อมูลลูกค้า (SUPER_ADMIN only) */
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, dto);
  }

  /** DELETE /customers/:id — soft delete (SUPER_ADMIN only) */
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.remove(id);
  }
}
