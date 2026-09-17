import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Booking, CustomerAddress } from 'src/database/entities';
import { IdentityService } from 'src/common/auth/identity.service';
import { CreateCustomerAddressDto } from './dto/create-address.dto';
import { UpdateCustomerAddressDto } from './dto/update-address.dto';

@Injectable()
export class CustomerAddressesService {
  constructor(
    @InjectRepository(CustomerAddress)
    private readonly addressRepo: Repository<CustomerAddress>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly identity: IdentityService,
  ) {}

  async list(userId: string) {
    const customerId = await this.identity.requireCustomerId(userId);
    const addresses = await this.addressRepo.find({
      where: { customerId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
    return addresses.map((address) => this.toResponse(address));
  }

  async create(userId: string, dto: CreateCustomerAddressDto) {
    const customerId = await this.identity.requireCustomerId(userId);
    const existing = await this.addressRepo.count({ where: { customerId } });

    const address = await this.addressRepo.save(
      this.addressRepo.create({
        customerId,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2 ?? null,
        landmark: dto.landmark ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        pincode: dto.pincode ?? null,
        latitude: dto.latitude === undefined ? null : String(dto.latitude),
        longitude: dto.longitude === undefined ? null : String(dto.longitude),
        addressType: dto.addressType ?? null,
        // The very first address is always the default one.
        isDefault: dto.isDefault === true || existing === 0,
      }),
    );

    if (address.isDefault)
      await this.clearOtherDefaults(customerId, address.id);
    return this.toResponse(address);
  }

  async update(userId: string, id: string, dto: UpdateCustomerAddressDto) {
    const customerId = await this.identity.requireCustomerId(userId);
    const address = await this.findOwn(customerId, id);

    if (dto.addressLine1 !== undefined) address.addressLine1 = dto.addressLine1;
    if (dto.addressLine2 !== undefined) address.addressLine2 = dto.addressLine2;
    if (dto.landmark !== undefined) address.landmark = dto.landmark;
    if (dto.city !== undefined) address.city = dto.city;
    if (dto.state !== undefined) address.state = dto.state;
    if (dto.pincode !== undefined) address.pincode = dto.pincode;
    if (dto.latitude !== undefined) address.latitude = String(dto.latitude);
    if (dto.longitude !== undefined) address.longitude = String(dto.longitude);
    if (dto.addressType !== undefined) address.addressType = dto.addressType;
    if (dto.isDefault !== undefined) address.isDefault = dto.isDefault;

    await this.addressRepo.save(address);
    if (dto.isDefault === true) {
      await this.clearOtherDefaults(customerId, address.id);
    }
    return this.toResponse(address);
  }

  async setDefault(userId: string, id: string) {
    const customerId = await this.identity.requireCustomerId(userId);
    const address = await this.findOwn(customerId, id);

    await this.clearOtherDefaults(customerId, address.id);
    address.isDefault = true;
    await this.addressRepo.save(address);
    return this.toResponse(address);
  }

  async remove(userId: string, id: string) {
    const customerId = await this.identity.requireCustomerId(userId);
    const address = await this.findOwn(customerId, id);

    const usedByBookings = await this.bookingRepo.count({
      where: { addressId: address.id },
    });
    if (usedByBookings) {
      throw new ConflictException(
        'This address is used by a booking and cannot be deleted',
      );
    }

    await this.addressRepo.remove(address);
    return { id, deleted: true };
  }

  private async findOwn(customerId: string, id: string) {
    const address = await this.addressRepo.findOne({
      where: { id, customerId },
    });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  /** Keeps the "one default per customer" invariant. */
  private async clearOtherDefaults(customerId: string, keepId: string) {
    await this.addressRepo.update(
      { customerId, id: Not(keepId) },
      { isDefault: false },
    );
  }

  private toResponse(address: CustomerAddress) {
    return {
      id: address.id,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      latitude: address.latitude === null ? null : Number(address.latitude),
      longitude: address.longitude === null ? null : Number(address.longitude),
      addressType: address.addressType,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
}
