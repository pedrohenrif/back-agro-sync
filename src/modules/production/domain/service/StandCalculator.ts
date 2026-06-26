export class StandCalculator {
  static calculate(area: number, spacingX: number, spacingY: number) {
    return Math.round(area / (spacingX * spacingY));
  }
}