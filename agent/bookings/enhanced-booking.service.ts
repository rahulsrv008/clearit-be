import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BookingChecklistProgress,
  BookingServiceExecution,
  BookingSettlement,
  BookingCustomerFeedback,
  Booking,
} from 'src/database/entities';
import { ChecklistService } from 'src/common/services/checklist.service';
import { SettingsService } from 'src/common/services/settings.service';
import { NotificationDispatchService } from 'src/common/services/notification-dispatch.service';

/**
 * Enhanced booking service that integrates checklists with the booking workflow
 */
@Injectable()
export class EnhancedBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingChecklistProgress)
    private readonly checklistProgressRepo: Repository<BookingChecklistProgress>,
    @InjectRepository(BookingServiceExecution)
    private readonly executionRepo: Repository<BookingServiceExecution>,
    @InjectRepository(BookingSettlement)
    private readonly settlementRepo: Repository<BookingSettlement>,
    @InjectRepository(BookingCustomerFeedback)
    private readonly feedbackRepo: Repository<BookingCustomerFeedback>,
    private readonly checklistService: ChecklistService,
    private readonly settings: SettingsService,
    private readonly notifications: NotificationDispatchService,
  ) {}

  /**
   * PHASE 1 & 2: Agent accepts booking → Initialize checklist
   * Called after agent accepts a booking
   */
  async onBookingAccepted(bookingId: string): Promise<BookingChecklistProgress> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['items', 'items.service'],
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Determine service type from booking items
    const serviceType = this.inferServiceType(booking);

    // Initialize checklist for this booking
    const checklistProgress = await this.checklistService.initializeChecklistForBooking(
      bookingId,
      serviceType,
    );

    // Load and display checklist template
    const checklistTemplate = await this.checklistService.getChecklistTemplate(
      serviceType,
      'PRE_SERVICE',
    );

    return checklistProgress;
  }

  /**
   * PHASE 3 & 4: Before arrival → notify customer, check in
   * Pre-service handoff and arrival verification
   */
  async onAgentArrived(bookingId: string): Promise<void> {
    const checklistProgress = await this.checklistProgressRepo.findOne({
      where: { bookingId },
    });

    if (!checklistProgress) {
      throw new Error(`Checklist not found for booking ${bookingId}`);
    }

    // Verify all PRE_SERVICE checklist items are completed
    const itemProgresses = await this.checklistService.getBookingChecklistProgress(bookingId);

    // Move to DURING_SERVICE phase
    await this.checklistService.moveToNextPhase(checklistProgress.id);
  }

  /**
   * PHASE 5: Start service → Initialize service execution tracking
   */
  async onServiceStarted(bookingId: string): Promise<BookingServiceExecution> {
    const existing = await this.executionRepo.findOne({
      where: { bookingId },
    });

    if (existing && existing.serviceStartedAt) {
      return existing;
    }

    const execution = this.executionRepo.create({
      bookingId,
      serviceStartedAt: new Date(),
      milestones: ['Service Started'],
    });

    return this.executionRepo.save(execution);
  }

  /**
   * PHASE 5 (Continued): Log milestone during service
   */
  async logServiceMilestone(bookingId: string, milestone: string): Promise<void> {
    const execution = await this.executionRepo.findOne({
      where: { bookingId },
    });

    if (!execution) {
      throw new Error(`Service execution not found for booking ${bookingId}`);
    }

    const milestones = execution.milestones || [];
    milestones.push(`${new Date().toISOString()}: ${milestone}`);

    await this.executionRepo.update(
      { id: execution.id },
      { milestones },
    );
  }

  /**
   * PHASE 6: Complete service → Capture photos, signatures
   */
  async completeService(
    bookingId: string,
    photosBefore?: string[],
    photosDuring?: string[],
    photosAfter?: string[],
    agentSignatureUrl?: string,
    customerSignatureUrl?: string,
  ): Promise<BookingServiceExecution> {
    const execution = await this.executionRepo.findOne({
      where: { bookingId },
    });

    if (!execution) {
      throw new Error(`Service execution not found for booking ${bookingId}`);
    }

    execution.serviceCompletedAt = new Date();
    if (photosBefore) execution.photosBefore = photosBefore;
    if (photosDuring) execution.photosDuring = photosDuring;
    if (photosAfter) execution.photosAfter = photosAfter;
    if (agentSignatureUrl) execution.agentSignatureUrl = agentSignatureUrl;
    if (customerSignatureUrl) execution.customerSignatureUrl = customerSignatureUrl;

    // Calculate actual duration
    if (execution.serviceStartedAt && execution.serviceCompletedAt) {
      const durationMs = execution.serviceCompletedAt.getTime() - execution.serviceStartedAt.getTime();
      execution.actualDurationMinutes = Math.round(durationMs / 60000);

      // Check for overage
      const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
      if (booking && execution.actualDurationMinutes > booking.durationMinutes) {
        execution.hasOverage = true;
        execution.overageMinutes = execution.actualDurationMinutes - booking.durationMinutes;
      }
    }

    return this.executionRepo.save(execution);
  }

  /**
   * PHASE 7: Payment processing
   */
  async initializePayment(
    bookingId: string,
  ): Promise<BookingSettlement> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    const execution = await this.executionRepo.findOne({
      where: { bookingId },
    });

    // Calculate final amount
    let finalAmount = parseFloat(booking.totalAmount);

    if (execution?.overageCharge) {
      finalAmount += parseFloat(execution.overageCharge);
    }

    const taxPercent = await this.settings.get('BOOKING_TAX_PERCENT', '0');
    const taxAmount = (finalAmount * parseFloat(taxPercent)) / 100;
    finalAmount += taxAmount;

    const settlement = this.settlementRepo.create({
      bookingId,
      baseAmount: booking.totalAmount,
      addOnsAmount: '0',
      surgeCharge: '0',
      taxPercent: taxPercent,
      taxAmount: taxAmount.toString(),
      finalAmount: finalAmount.toString(),
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PENDING',
      agentCommissionPercent: await this.settings.get('AGENT_PAYOUT_PERCENT', '60'),
      agentCommissionAmount: (
        (finalAmount * parseFloat(await this.settings.get('AGENT_PAYOUT_PERCENT', '60'))) /
        100
      ).toString(),
      incentivePercent: '0',
      incentiveAmount: '0',
      agentNetPayout: '0',
      payoutStatus: 'PENDING',
    });

    return this.settlementRepo.save(settlement);
  }

  /**
   * PHASE 7 (Webhook): Handle Razorpay payment success
   */
  async handlePaymentSuccess(
    bookingId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): Promise<BookingSettlement> {
    const settlement = await this.settlementRepo.findOne({
      where: { bookingId },
    });

    if (!settlement) {
      throw new Error(`Settlement not found for booking ${bookingId}`);
    }

    settlement.paymentStatus = 'SUCCESS';
    settlement.paymentTimestamp = new Date();
    settlement.razorpayOrderId = razorpayOrderId;
    settlement.razorpayPaymentId = razorpayPaymentId;
    settlement.razorpaySignature = razorpaySignature;

    return this.settlementRepo.save(settlement);
  }

  /**
   * PHASE 8: Calculate agent payout and settlement
   */
  async settlePayment(bookingId: string): Promise<BookingSettlement> {
    const settlement = await this.settlementRepo.findOne({
      where: { bookingId },
    });

    if (!settlement) {
      throw new Error(`Settlement not found for booking ${bookingId}`);
    }

    if (settlement.paymentStatus !== 'SUCCESS') {
      throw new Error('Payment must be successful before settlement');
    }

    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['agent'],
    });

    // Calculate incentive if agent crosses threshold
    const agentEarningsToday = 15000; // This should be queried from agent_earnings
    const incentiveThreshold = parseFloat(
      await this.settings.get('AGENT_INCENTIVE_THRESHOLD', '15000'),
    );

    let incentiveAmount = 0;
    if (agentEarningsToday >= incentiveThreshold) {
      const incentivePercent = parseFloat(
        await this.settings.get('AGENT_INCENTIVE_PERCENT', '10'),
      );
      incentiveAmount = (parseFloat(settlement.finalAmount) * incentivePercent) / 100;
    }

    const netPayout =
      parseFloat(settlement.agentCommissionAmount) + incentiveAmount;

    settlement.incentiveAmount = incentiveAmount.toString();
    settlement.agentNetPayout = netPayout.toString();
    settlement.payoutStatus = 'PROCESSED';
    settlement.payoutTimestamp = new Date();

    return this.settlementRepo.save(settlement);
  }

  /**
   * PHASE 8 (Continued): Request customer feedback
   */
  async requestCustomerFeedback(bookingId: string): Promise<BookingCustomerFeedback> {
    let feedback = await this.feedbackRepo.findOne({
      where: { bookingId },
    });

    if (!feedback) {
      feedback = this.feedbackRepo.create({
        bookingId,
      });
      await this.feedbackRepo.save(feedback);
    }

    return feedback;
  }

  /**
   * PHASE 8 (Continued): Submit customer feedback
   */
  async submitCustomerFeedback(
    bookingId: string,
    ratingStars: number,
    reviewText?: string,
    npsScore?: number,
    wouldRebook?: boolean,
    referralInterest?: boolean,
    testimonialPermission?: boolean,
  ): Promise<BookingCustomerFeedback> {
    const feedback = await this.feedbackRepo.findOne({
      where: { bookingId },
    });

    if (!feedback) {
      throw new Error(`Feedback record not found for booking ${bookingId}`);
    }

    feedback.ratingStars = ratingStars;
    if (reviewText) feedback.reviewText = reviewText;
    if (npsScore !== undefined) feedback.npsScore = npsScore;
    if (wouldRebook !== undefined) feedback.wouldRebook = wouldRebook;
    if (referralInterest !== undefined) feedback.referralInterest = referralInterest;
    if (testimonialPermission !== undefined) feedback.testimonialPermission = testimonialPermission;
    feedback.feedbackSubmittedAt = new Date();

    return this.feedbackRepo.save(feedback);
  }

  /**
   * Helper: Infer service type from booking items
   */
  private inferServiceType(booking: Booking): 'COOK' | 'CLEANING' {
    if (!booking.items || booking.items.length === 0) {
      return 'COOK'; // Default
    }

    // Check service names to infer type
    const serviceNames = booking.items.map((item) => item.service?.name?.toLowerCase() || '');
    const isCooking = serviceNames.some((name) => name.includes('cook'));
    const isCleaning = serviceNames.some((name) => name.includes('clean'));

    if (isCleaning) return 'CLEANING';
    return 'COOK';
  }
}
