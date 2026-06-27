import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

type SupplyUsageRow = { quantity_used: number; used_at: Date; unit_price: number | null };
type GardenRow = { id: number; name: string; lot_code: string; crop: string; is_active: boolean };

export const getOrgSummary = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { from, to } = req.query;

  const dateFilter: any = {};
  if (from) dateFilter.gte = new Date(String(from));
  if (to) dateFilter.lte = new Date(String(to));
  const hasDateFilter = from || to;

  // SupplyUsage e Supply pertencem ao supply-service — consulta via SQL raw
  const usageWhere = hasDateFilter
    ? `su."organization_id" = ${organizationId} AND su."used_at" BETWEEN '${from || '1970-01-01'}' AND '${to || '2099-01-01'}'`
    : `su."organization_id" = ${organizationId}`;

  const [expenses, sales, supplyUsages] = await Promise.all([
    prisma.expense.findMany({
      where: { organizationId, ...(hasDateFilter ? { date: dateFilter } : {}) },
      include: { category: true },
    }),
    prisma.harvestSale.findMany({
      where: { organizationId, ...(hasDateFilter ? { saleDate: dateFilter } : {}) },
    }),
    prisma.$queryRawUnsafe<SupplyUsageRow[]>(
      `SELECT su."quantity_used", su."used_at", s."unit_price"
       FROM "SupplyUsage" su
       JOIN "Supply" s ON s.id = su."supply_id"
       WHERE ${usageWhere}`
    ),
  ]);

  const manualExpenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const inputCostTotal = supplyUsages.reduce((sum, u) => sum + u.quantity_used * (u.unit_price ?? 0), 0);
  const totalExpenses = manualExpenseTotal + inputCostTotal;
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const byCategory: Record<string, { name: string; color: string; total: number }> = {};
  for (const e of expenses) {
    const key = String(e.categoryId);
    if (!byCategory[key]) byCategory[key] = { name: e.category.name, color: e.category.color, total: 0 };
    byCategory[key].total += e.amount;
  }
  if (inputCostTotal > 0) {
    byCategory['inputs'] = { name: 'Insumos (automático)', color: '#16a34a', total: inputCostTotal };
  }

  const monthlyMap: Record<string, { month: string; revenue: number; expenses: number }> = {};
  const getMonth = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  for (const s of sales) {
    const m = getMonth(new Date(s.saleDate));
    if (!monthlyMap[m]) monthlyMap[m] = { month: m, revenue: 0, expenses: 0 };
    monthlyMap[m].revenue += s.totalAmount;
  }
  for (const e of expenses) {
    const m = getMonth(new Date(e.date));
    if (!monthlyMap[m]) monthlyMap[m] = { month: m, revenue: 0, expenses: 0 };
    monthlyMap[m].expenses += e.amount;
  }
  for (const u of supplyUsages) {
    const m = getMonth(new Date(u.used_at));
    if (!monthlyMap[m]) monthlyMap[m] = { month: m, revenue: 0, expenses: 0 };
    monthlyMap[m].expenses += u.quantity_used * (u.unit_price ?? 0);
  }

  res.json({
    totalRevenue,
    totalExpenses,
    netProfit,
    margin: Number(margin.toFixed(1)),
    manualExpenseTotal,
    inputCostTotal,
    byCategory: Object.values(byCategory),
    cashflow: Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)),
  });
};

export const getGardenSummary = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;

  // Garden pertence ao garden-service — consulta via SQL raw
  const gardens = await prisma.$queryRaw<GardenRow[]>`
    SELECT id, name, "lot_code", crop, "is_active"
    FROM "Garden"
    WHERE "organization_id" = ${organizationId}
  `;

  const result = await Promise.all(
    gardens.map(async (g) => {
      const [expAgg, saleAgg, usages] = await Promise.all([
        prisma.expense.aggregate({ where: { organizationId, gardenId: g.id }, _sum: { amount: true } }),
        prisma.harvestSale.aggregate({ where: { organizationId, gardenId: g.id }, _sum: { totalAmount: true, quantityKg: true } }),
        prisma.$queryRaw<SupplyUsageRow[]>`
          SELECT su."quantity_used", su."used_at", s."unit_price"
          FROM "SupplyUsage" su
          JOIN "Supply" s ON s.id = su."supply_id"
          WHERE su."organization_id" = ${organizationId} AND su."garden_id" = ${g.id}
        `,
      ]);

      const inputCost = usages.reduce((s, u) => s + u.quantity_used * (u.unit_price ?? 0), 0);
      const totalCost = (expAgg._sum.amount ?? 0) + inputCost;
      const totalRevenue = saleAgg._sum.totalAmount ?? 0;
      const totalKg = saleAgg._sum.quantityKg ?? 0;

      return {
        gardenId: g.id,
        gardenName: g.name,
        lotCode: g.lot_code,
        crop: g.crop,
        isActive: g.is_active,
        totalRevenue,
        totalExpenses: totalCost,
        netProfit: totalRevenue - totalCost,
        margin: totalRevenue > 0 ? Number(((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1)) : 0,
        totalKgSold: totalKg,
      };
    })
  );

  res.json(result);
};
