export class LotCodeGenerator {
  /**
   * Ex: ALF-2026-X8K2J
   */
  static generate(cropName: string): string {
    const cleanCrop = cropName || "Vazio";
    
    const sigla = cleanCrop.length >= 3 
      ? cleanCrop.substring(0, 3).toUpperCase() 
      : "VAZ";

    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(7).toUpperCase();

    return `${sigla}-${year}-${random}`;
  }
}