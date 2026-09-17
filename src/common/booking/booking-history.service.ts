import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus, BookingStatusHistory } from 'src/database/entities';
import { assertTransition } from './booking-status';

/**
 * Every booking status change goes through here so `booking_status_history`
 * stays a complete audit trail across the customer, agent and admin apps.
 */
@Injectable()
export class BookingHistoryService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingStatusHistory)
    private readonly historyRepo: Repository<BookingStatusHistory>,
  ) {}

  record(
    bookingId: string,
    status: string,
    changedBy?: string | null,
    remarks?: string | null,
  ) {
    return this.historyRepo.save(
      this.historyRepo.create({
        bookingId,
        status,
        changedBy: changedBy ?? null,
        remarks: remarks ?? null,
      }),
    );
  }

  /** Validates the transition, persists the booking, and writes history. */
  async transition(
    booking: Booking,
    next: BookingStatus,
    changedBy?: string | null,
    remarks?: string | null,
  ) {
    assertTransition(booking.status, next);
    booking.status = next;
    const saved = await this.bookingRepo.save(booking);
    await this.record(booking.id, next, changedBy, remarks);
    return saved;
  }

  async findOrFail(bookingId: string, relations: string[] = []) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  history(bookingId: string) {
    return this.historyRepo.find({
      where: { bookingId },
      order: { createdAt: 'ASC' },
    });
  }
}
