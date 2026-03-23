import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerUserController } from './customer-user.controller';
import { CustomerUserService } from './customer-user.service';

@Module({
  controllers: [CustomerController, CustomerUserController],
  providers: [CustomerService, CustomerUserService],
  exports: [CustomerService],
})
export class CustomerModule {}
