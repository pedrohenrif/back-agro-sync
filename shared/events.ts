// Contratos de eventos do barramento RabbitMQ do AgroSync
// Todos os serviços importam daqui para garantir consistência de nomes

export const EXCHANGE = 'agrosync.events';

export const EVENTS = {
  // Supply Service → emite
  SUPPLY_LOW_STOCK: 'supply.low_stock',
  SUPPLY_STOCK_UPDATED: 'supply.stock.updated',

  // Garden Service → emite
  CROP_CYCLE_STARTED: 'crop_cycle.started',
  HARVEST_RECORDED: 'harvest.recorded',
  GARDEN_CREATED: 'garden.created',

  // AI Service → emite
  AI_QUESTION_QUEUED: 'ai.question.queued',
  AI_ANSWER_READY: 'ai.answer.ready',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];

// Payloads tipados de cada evento
export interface SupplyLowStockPayload {
  organizationId: number;
  supplyId: number;
  supplyName: string;
  currentQuantity: number;
  minStock: number;
}

export interface CropCycleStartedPayload {
  organizationId: number;
  gardenId: number;
  cropPlanId: number;
  planName: string;
  startDate: string;
  expectedHarvestDate: string;
}

export interface HarvestRecordedPayload {
  organizationId: number;
  gardenId: number;
  yieldKg: number;
  harvestDate: string;
}

export interface GardenCreatedPayload {
  organizationId: number;
  gardenId: number;
  gardenName: string;
  crop: string;
}

export interface AiQuestionPayload {
  userId: number;
  organizationId: number;
  question: string;
  correlationId: string;
}
