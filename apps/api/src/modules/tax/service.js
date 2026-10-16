import prisma from '../../lib/prisma.js';

export async function createTaxRate(orgId, data) {
  return await prisma.taxRate.create({
    data: {
      organizationId: orgId,
      name: data.name,
      rate: data.rate,
      country: data.country,
      region: data.region ?? null,
      active: data.active ?? true,
    },
  });
}

export async function listTaxRates(orgId, filters = {}) {
  const where = { organizationId: orgId };
  if (filters.active !== undefined) {
    where.active = filters.active;
  }
  if (filters.country) {
    where.country = filters.country;
  }
  return await prisma.taxRate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTaxRate(id, orgId) {
  const taxRate = await prisma.taxRate.findFirst({
    where: { id, organizationId: orgId },
  });
  if (!taxRate) {
    const err = new Error('Tax rate not found');
    err.status = 404;
    throw err;
  }
  return taxRate;
}

export async function updateTaxRate(id, orgId, data) {
  await getTaxRate(id, orgId);
  return await prisma.taxRate.update({
    where: { id },
    data,
  });
}

export async function deleteTaxRate(id, orgId) {
  await getTaxRate(id, orgId);
  return await prisma.taxRate.update({
    where: { id },
    data: { active: false },
  });
}

export async function calculateTax(orgId, { amountMinor, country, region }) {
  // Find most-specific rate: country+region first, then country-only
  let taxRate = null;

  if (region) {
    taxRate = await prisma.taxRate.findFirst({
      where: { organizationId: orgId, country, region, active: true },
    });
  }

  if (!taxRate) {
    taxRate = await prisma.taxRate.findFirst({
      where: { organizationId: orgId, country, region: null, active: true },
    });
  }

  if (!taxRate) {
    const err = new Error('No matching tax rate found for the given country/region');
    err.status = 404;
    throw err;
  }

  const taxAmountMinor = BigInt(Math.floor(Number(amountMinor) * Number(taxRate.rate) / 100));

  return {
    taxRateId: taxRate.id,
    ratePercent: Number(taxRate.rate),
    taxAmountMinor,
  };
}

export async function applyTaxToInvoice(invoiceId, orgId, { country, region }) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: orgId },
  });

  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }

  if (invoice.status !== 'DRAFT') {
    const err = new Error(`Cannot apply tax to invoice in ${invoice.status} state`);
    err.status = 422;
    throw err;
  }

  const { taxRateId, taxAmountMinor } = await calculateTax(orgId, {
    amountMinor: Number(invoice.subtotalMinor),
    country,
    region,
  });

  const result = await prisma.$transaction([
    prisma.invoiceLine.create({
      data: {
        invoiceId,
        description: 'Tax',
        quantity: 1,
        unitAmountMinor: taxAmountMinor,
        amountMinor: taxAmountMinor,
        metadata: { type: 'TAX', taxRateId },
      },
    }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        taxMinor: taxAmountMinor,
        totalMinor: invoice.subtotalMinor + taxAmountMinor,
      },
    }),
  ]);

  return result[1];
}
