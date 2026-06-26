export interface CreateGardenDTO {
  name: string;
  crop?: string;
  plantingDate?: string;
  sizeInM2: number;
  location?: string;
  cropPlanId?: number;
}