export interface ChecklistItemDto {
  id: string;
  taskName: string;
  description?: string;
  sequenceOrder: number;
  isRequired: boolean;
  estimatedTimeMinutes?: number;
  requiresPhoto: boolean;
  requiresNotes: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  photoUrl?: string;
  notes?: string;
}

export interface ChecklistDto {
  id: string;
  checklistName: string;
  phase: string;
  items: ChecklistItemDto[];
  description?: string;
}

export interface ChecklistProgressDto {
  id: string;
  bookingId: string;
  serviceType: string;
  currentPhase: string;
  status: string;
  completionPercentage: number;
  checklists?: ChecklistDto[];
  itemProgress?: ChecklistItemDto[];
}

export interface CompleteChecklistItemDto {
  photoUrl?: string;
  notes?: string;
}

export interface ChecklistStatusResponseDto {
  success: boolean;
  message: string;
  data?: ChecklistProgressDto;
}
