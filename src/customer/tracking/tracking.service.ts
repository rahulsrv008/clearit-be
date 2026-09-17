import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentLocation, Booking, BookingStatus } from 'src/database/entities';
import { IdentityService } from 'src/common/auth/identity.service';

/** Statuses where the agent is on the move and pings are meaningful. */
const TRACKABLE: BookingStatus[] = ['accepted', 'arriving', 'ongoing'];

@Injectable()
export class CustomerTrackingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(AgentLocation)
    private readonly locationRepo: Repository<AgentLocation>,
    private readonly identity: IdentityService,
  ) {}

  async tracking(userId: string, bookingId: string) {
    const customerId = await this.identity.requireCustomerId(userId);
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId, customerId },
      relations: ['address'],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const lastPing = await this.locationRepo.findOne({
      where: { bookingId: booking.id },
      order: { recordedAt: 'DESC' },
    });

    return {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      agentId: booking.agentId,
      live: TRACKABLE.includes(booking.status) && !!lastPing,
      lastPing: lastPing
        ? {
            latitude: Number(lastPing.latitude),
            longitude: Number(lastPing.longitude),
            recordedAt: lastPing.recordedAt,
          }
        : null,
      destination:
        booking.address?.latitude && booking.address?.longitude
          ? {
              latitude: Number(booking.address.latitude),
              longitude: Number(booking.address.longitude),
            }
          : null,
    };
  }
}
