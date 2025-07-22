

import type {
  Transaction,
  ShareClass,
  VestingSchedule,
  Shareholding,
  CapTable,
  CapTableEntry,
  ConvertibleLoanTransaction,
  DebtInstrumentTransaction,
  VotingResult,
  VoteDistributionEntry,
  WaterfallResult,
  WaterfallDistribution,
  FinancingRoundTransaction,
  TotalCapitalizationResult,
  TotalCapitalizationEntry,
  CashflowResult,
  CashflowEntry,
  EqualizationPurchaseTransaction,
  FoundingTransaction,
  ProjectAssessmentResult,
  AssessmentFinding,
  StakeholderPayoutSummaryResult,
  StakeholderPayoutSummaryEntry
} from '../types';
import { TransactionType, ConversionMechanism, TransactionStatus } from '../types';
import type { Translations } from '../i18n';

export const getShareClassesAsOf = (transactions: Transaction[], asOfDate: string): Map<string, ShareClass> => {
    const asOf = new Date(asOfDate);
    const shareClasses = new Map<string, ShareClass>();

    const sortedTxs = [...transactions]
        .filter(tx => new Date(tx.date) <= asOf && tx.status === 'ACTIVE')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const tx of sortedTxs) {
        if (tx.type === TransactionType.FOUNDING) {
            tx.shareClasses.forEach(sc => shareClasses.set(sc.id, { ...sc }));
        } else if (tx.type === TransactionType.FINANCING_ROUND) {
            shareClasses.set(tx.newShareClass.id, { ...tx.newShareClass });
        } else if (tx.type === TransactionType.UPDATE_SHARE_CLASS) {
            const scToUpdate = shareClasses.get(tx.shareClassIdToUpdate);
            if (scToUpdate) {
                shareClasses.set(tx.shareClassIdToUpdate, { ...scToUpdate, ...tx.updatedProperties });
            }
        }
    }
    return shareClasses;
};

const getVestingSchedulesAsOf = (transactions: Transaction[], asOfDate: string): Map<string, VestingSchedule> => {
    const asOf = new Date(asOfDate);
    const schedules = new Map<string, VestingSchedule>();

    const sortedTxs = [...transactions]
        .filter(tx => new Date(tx.date) <= asOf && tx.status === 'ACTIVE')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const tx of sortedTxs) {
        if (tx.type === TransactionType.FOUNDING && tx.vestingSchedules) {
            tx.vestingSchedules.forEach(vs => schedules.set(vs.id, { ...vs }));
        }
    }
    return schedules;
};

const calculateVestedShares = (shareholding: Shareholding, vestingSchedules: Map<string, VestingSchedule>, asOfDate: string): number => {
    if (!shareholding.vestingScheduleId) {
        return shareholding.shares;
    }
    const schedule = vestingSchedules.get(shareholding.vestingScheduleId);
    if (!schedule) {
        return shareholding.shares;
    }

    const asOf = new Date(asOfDate);
    const grantDate = new Date(schedule.grantDate);
    
    if (asOf < grantDate) return 0;

    const monthsPassed = (asOf.getFullYear() - grantDate.getFullYear()) * 12 + (asOf.getMonth() - grantDate.getMonth());

    if (monthsPassed < schedule.cliffMonths) {
        return 0;
    }
    
    if (schedule.vestingPeriodMonths === 0) return shareholding.shares;

    const vestedMonths = Math.min(monthsPassed, schedule.vestingPeriodMonths);
    const vestedShares = Math.floor((vestedMonths / schedule.vestingPeriodMonths) * shareholding.shares);
    
    return vestedShares;
};

export const calculateAccruedInterest = (instrument: ConvertibleLoanTransaction | DebtInstrumentTransaction, asOfDate: string): number => {
    if (!instrument.interestRate || instrument.interestRate === 0) {
        return 0;
    }
    const startDate = new Date(instrument.date);
    const endDate = new Date(asOfDate);
    if (endDate < startDate) {
        return 0;
    }

    const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return instrument.amount * instrument.interestRate * years;
};

export const calculateCapTable = (
    transactions: Transaction[],
    asOfDate: string,
    excludeTxId?: string
): CapTable => {
    const relevantTxs = transactions
        .filter(tx => tx.status === TransactionStatus.ACTIVE && new Date(tx.date) <= new Date(asOfDate) && tx.id !== excludeTxId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const allShareClasses = getShareClassesAsOf(relevantTxs, asOfDate);
    const vestingSchedules = getVestingSchedulesAsOf(relevantTxs, asOfDate);

    const holdingsByStakeholder = new Map<string, Map<string, number>>();
    const allShareholdingDetails = new Map<string, Shareholding[]>();
    const stakeholderNames = new Map<string, string>();

    const addShares = (sh: Shareholding) => {
        stakeholderNames.set(sh.stakeholderId, sh.stakeholderName);

        if (!holdingsByStakeholder.has(sh.stakeholderId)) {
            holdingsByStakeholder.set(sh.stakeholderId, new Map());
        }
        const stakeholderHoldings = holdingsByStakeholder.get(sh.stakeholderId)!;
        stakeholderHoldings.set(sh.shareClassId, (stakeholderHoldings.get(sh.shareClassId) || 0) + sh.shares);

        if (!allShareholdingDetails.has(sh.stakeholderId)) {
            allShareholdingDetails.set(sh.stakeholderId, []);
        }
        
        const holdingsList = allShareholdingDetails.get(sh.stakeholderId)!;
        const existingShareholding = holdingsList.find(h => h.shareClassId === sh.shareClassId && h.originalPricePerShare === sh.originalPricePerShare);

        if (existingShareholding) {
            existingShareholding.shares += sh.shares;
            existingShareholding.investment = (existingShareholding.investment || 0) + (sh.investment || 0);
        } else {
            holdingsList.push({ ...sh });
        }
    };

    const removeShares = (stakeholderId: string, shareClassId: string, shares: number) => {
        if (!holdingsByStakeholder.has(stakeholderId)) return;
        const stakeholderHoldings = holdingsByStakeholder.get(stakeholderId)!;
        const currentShares = stakeholderHoldings.get(shareClassId) || 0;
        stakeholderHoldings.set(shareClassId, Math.max(0, currentShares - shares));

        const shDetails = allShareholdingDetails.get(stakeholderId)?.find(h => h.shareClassId === shareClassId);
        if (shDetails) {
            shDetails.shares = Math.max(0, shDetails.shares - shares);
        }
    };

    for (const tx of relevantTxs) {
        switch (tx.type) {
            case TransactionType.FOUNDING:
                tx.shareholdings.forEach(sh => addShares(sh));
                break;
            case TransactionType.FINANCING_ROUND: {
                const roundTx = tx as FinancingRoundTransaction;
                const capTableBefore = calculateCapTable(transactions, roundTx.date, roundTx.id);
                const pps = capTableBefore.totalShares > 0 ? roundTx.preMoneyValuation / capTableBefore.totalShares : 0;
                
                // If shares are not pre-calculated in the transaction, calculate them now.
                roundTx.newShareholdings.forEach(sh => {
                    if (!sh.shares && sh.investment && pps > 0) {
                        sh.shares = Math.round(sh.investment / pps);
                        sh.originalPricePerShare = pps;
                    }
                });

                // Anti-Dilution Calculations
                const antiDilutionAdjustments: Shareholding[] = [];
                if (pps > 0) {
                    const totalNewInvestment = roundTx.newShareholdings.reduce((sum, sh) => sum + (sh.investment || 0), 0);
                    const sharesFromNewInvestment = totalNewInvestment / pps;

                    for (const sh of capTableBefore.entries) {
                        const shareClass = getShareClassesAsOf(relevantTxs, roundTx.date).get(sh.shareClassId);
                        if (!shareClass || shareClass.antiDilutionProtection === 'NONE' || !sh.initialInvestment) continue;

                        const originalPPS = (sh.initialInvestment > 0 && sh.shares > 0) ? sh.initialInvestment / sh.shares : 0;
                        if (originalPPS === 0 || pps >= originalPPS) continue;

                        let additionalShares = 0;
                        if (shareClass.antiDilutionProtection === 'FULL_RATCHET') {
                            const newShareCount = sh.initialInvestment / pps;
                            additionalShares = Math.round(newShareCount - sh.shares);
                        } else if (shareClass.antiDilutionProtection === 'BROAD_BASED') {
                            const A = capTableBefore.totalShares; // Outstanding before new round
                            const B = totalNewInvestment / originalPPS; // Shares that would have been issued at old price
                            const C = sharesFromNewInvestment; // Shares actually issued
                            const newConversionPrice = originalPPS * (A + B) / (A + C);
                            const newShareCount = sh.initialInvestment / newConversionPrice;
                            additionalShares = Math.round(newShareCount - sh.shares);
                        } else if (shareClass.antiDilutionProtection === 'NARROW_BASED') {
                            // Simplified narrow-based: A = only shares of same or more senior classes
                             const narrowShares = capTableBefore.entries
                                .filter(e => {
                                    const sc = getShareClassesAsOf(relevantTxs, roundTx.date).get(e.shareClassId);
                                    return sc && sc.liquidationPreferenceRank >= shareClass.liquidationPreferenceRank;
                                })
                                .reduce((sum, e) => sum + e.shares, 0);
                            const A = narrowShares;
                            const B = totalNewInvestment / originalPPS;
                            const C = sharesFromNewInvestment;
                            const newConversionPrice = originalPPS * (A + B) / (A + C);
                            const newShareCount = sh.initialInvestment / newConversionPrice;
                            additionalShares = Math.round(newShareCount - sh.shares);
                        }

                        if (additionalShares > 0) {
                            antiDilutionAdjustments.push({
                                id: `ad-${sh.stakeholderId}-${sh.shareClassId}`,
                                stakeholderId: sh.stakeholderId,
                                stakeholderName: sh.stakeholderName,
                                shareClassId: sh.shareClassId,
                                shares: additionalShares,
                                investment: 0, // No new investment for anti-dilution shares
                                originalPricePerShare: 0,
                                vestingScheduleId: sh.vestingScheduleId
                            });
                        }
                    }
                }
                
                antiDilutionAdjustments.forEach(adj => addShares(adj));
                roundTx.newShareholdings.forEach(sh => addShares(sh));
                
                if (roundTx.convertsLoanIds) {
                    for (const loanId of roundTx.convertsLoanIds) {
                        const loanTx = relevantTxs.find(t => t.id === loanId && t.type === TransactionType.CONVERTIBLE_LOAN) as ConvertibleLoanTransaction | undefined;
                        if (!loanTx) continue;

                        const interest = calculateAccruedInterest(loanTx, roundTx.date);
                        const conversionAmount = loanTx.amount + interest;
                        let conversionPrice = pps;

                        if (loanTx.conversionMechanism === ConversionMechanism.CAP_AND_DISCOUNT) {
                            const discountedPrice = pps * (1 - (loanTx.discount || 0));
                            const capPrice = loanTx.valuationCap && capTableBefore.totalShares > 0 ? loanTx.valuationCap / capTableBefore.totalShares : Infinity;
                            conversionPrice = Math.min(discountedPrice, capPrice, pps);
                        } else if (loanTx.conversionMechanism === ConversionMechanism.FIXED_PRICE) {
                            conversionPrice = loanTx.fixedConversionPrice ?? 0;
                        } else if (loanTx.conversionMechanism === ConversionMechanism.FIXED_RATIO) {
                           const ratioShares = loanTx.ratioShares ?? 0;
                           const ratioAmount = loanTx.ratioAmount ?? 0;
                           const sharesPerAmount = ratioAmount > 0 ? ratioShares / ratioAmount : 0;
                           conversionPrice = sharesPerAmount > 0 ? 1 / sharesPerAmount : 0;
                        }
                        
                        const sharesFromConversion = conversionPrice > 0 ? Math.round(conversionAmount / conversionPrice) : 0;
                        addShares({
                            id: `conv-${loanTx.id}`,
                            stakeholderId: loanTx.stakeholderId,
                            stakeholderName: loanTx.investorName,
                            shareClassId: roundTx.newShareClass.id,
                            shares: sharesFromConversion,
                            investment: loanTx.amount,
                            originalPricePerShare: conversionPrice
                        });
                    }
                }
                break;
            }
            case TransactionType.SHARE_TRANSFER:
                removeShares(tx.sellerStakeholderId, tx.shareClassId, tx.numberOfShares);
                addShares({
                    id: tx.id,
                    stakeholderId: tx.buyerStakeholderId,
                    stakeholderName: tx.buyerStakeholderName,
                    shareClassId: tx.shareClassId,
                    shares: tx.numberOfShares,
                    investment: tx.pricePerShare * tx.numberOfShares,
                    originalPricePerShare: tx.pricePerShare
                });
                break;
            case TransactionType.EQUALIZATION_PURCHASE:
                addShares({
                    id: tx.id,
                    stakeholderId: tx.newStakeholderId,
                    stakeholderName: tx.newStakeholderName,
                    shareClassId: tx.shareClassId,
                    shares: tx.purchasedShares,
                    investment: tx.pricePerShare * tx.purchasedShares,
                    originalPricePerShare: tx.pricePerShare
                });
                break;
        }
    }

    const entries: CapTableEntry[] = [];
    let totalShares = 0;
    let totalVestedShares = 0;

    for (const [stakeholderId, stakeholderHoldings] of holdingsByStakeholder.entries()) {
        for (const [shareClassId, shares] of stakeholderHoldings.entries()) {
            if (shares <= 0) continue;

            const shDetailsList = allShareholdingDetails.get(stakeholderId);
            const shDetailsForClass = shDetailsList?.filter(sh => sh.shareClassId === shareClassId);
            if (!shDetailsForClass || shDetailsForClass.length === 0) continue;

            const totalInvestmentForClass = shDetailsForClass.reduce((sum, sh) => sum + (sh.investment || 0), 0);
            
            // For vesting, we need a single representative shareholding. This assumes vesting is consistent across a class for a user.
            const representativeSh = shDetailsForClass[0];

            const vestedShares = calculateVestedShares({ ...representativeSh, shares }, vestingSchedules, asOfDate);

            totalShares += shares;
            totalVestedShares += vestedShares;

            entries.push({
                stakeholderId,
                stakeholderName: stakeholderNames.get(stakeholderId)!,
                shareClassId,
                shareClassName: allShareClasses.get(shareClassId)?.name || 'Unknown',
                shares,
                vestedShares,
                percentage: 0,
                initialInvestment: totalInvestmentForClass,
                vestingScheduleId: representativeSh.vestingScheduleId,
            });
        }
    }

    entries.forEach(entry => {
        entry.percentage = totalShares > 0 ? (entry.shares / totalShares) * 100 : 0;
    });

    entries.sort((a, b) => b.shares - a.shares);

    return { asOfDate, totalShares, totalVestedShares, entries };
};

export const simulateVote = (capTable: CapTable, transactions: Transaction[]): VotingResult => {
    const asOfDate = capTable.asOfDate;
    const shareClasses = getShareClassesAsOf(transactions, asOfDate);
    const voteDistribution: VoteDistributionEntry[] = [];
    let totalVotes = 0;

    for (const entry of capTable.entries) {
        const shareClass = shareClasses.get(entry.shareClassId);
        if (shareClass) {
            const votes = entry.vestedShares * shareClass.votesPerShare;
            totalVotes += votes;
            voteDistribution.push({
                stakeholderName: entry.stakeholderName,
                shareClassName: entry.shareClassName,
                votes,
                percentage: 0
            });
        }
    }

    const aggregatedVotes = new Map<string, { votes: number; percentage: number; shareClassNames: Set<string> }>();
    voteDistribution.forEach(dist => {
        if (!aggregatedVotes.has(dist.stakeholderName)) {
            aggregatedVotes.set(dist.stakeholderName, { votes: 0, percentage: 0, shareClassNames: new Set() });
        }
        const stakeholderAgg = aggregatedVotes.get(dist.stakeholderName)!;
        stakeholderAgg.votes += dist.votes;
        stakeholderAgg.shareClassNames.add(dist.shareClassName);
    });

    const finalDistribution: VoteDistributionEntry[] = [];
    aggregatedVotes.forEach((data, name) => {
        const percentage = totalVotes > 0 ? (data.votes / totalVotes) * 100 : 0;
        finalDistribution.push({
            stakeholderName: name,
            shareClassName: Array.from(data.shareClassNames).join(', '),
            votes: data.votes,
            percentage
        });
    });

    finalDistribution.sort((a, b) => b.votes - a.votes);

    return {
        asOfDate,
        totalVotes,
        voteDistribution: finalDistribution
    };
};


export const simulateWaterfall = (
    capTable: CapTable,
    transactions: Transaction[],
    exitProceeds: number,
    transactionCosts: number,
    language: string
): WaterfallResult => {
    const calculationLog: string[] = [];
    const formatCurrency = (val: number) => val.toLocaleString(language, {minimumFractionDigits: 0, maximumFractionDigits: 0});

    const netExitProceeds = exitProceeds - transactionCosts;
    let remainingProceeds = netExitProceeds;
    calculationLog.push(`Start: Net Exit Proceeds = ${formatCurrency(exitProceeds)} - ${formatCurrency(transactionCosts)} = ${formatCurrency(netExitProceeds)}`);

    const activeTxs = transactions.filter(tx => tx.status === TransactionStatus.ACTIVE && new Date(tx.date) <= new Date(capTable.asOfDate));
    const allShareClasses = getShareClassesAsOf(activeTxs, capTable.asOfDate);
    
    const distributions = new Map<string, WaterfallDistribution>();
    capTable.entries.forEach(entry => {
        const key = `${entry.stakeholderId}-${entry.shareClassId}`;
        distributions.set(key, {
            stakeholderId: entry.stakeholderId,
            stakeholderName: entry.stakeholderName,
            shareClassId: entry.shareClassId,
            shareClassName: entry.shareClassName,
            initialInvestment: entry.initialInvestment || 0,
            fromDebtRepayment: 0,
            fromLiquidationPreference: 0,
            fromParticipation: 0,
            fromConvertedShares: 0,
            totalProceeds: 0,
            multiple: 0,
        });
    });
    
    // --- 1. Debt Repayment ---
    calculationLog.push(`--- Phase 1: Debt Repayment ---`);
    const debtInstruments = activeTxs.filter(tx => tx.type === TransactionType.DEBT_INSTRUMENT) as DebtInstrumentTransaction[];
    debtInstruments.sort((a, b) => {
        const order = { 'SENIOR_SECURED': 1, 'SENIOR_UNSECURED': 2, 'SUBORDINATED': 3 };
        return order[a.seniority] - order[b.seniority];
    });

    for (const debt of debtInstruments) {
        if (remainingProceeds <= 0) break;
        const interest = calculateAccruedInterest(debt, capTable.asOfDate);
        const amountToRepay = debt.amount + interest;
        const payment = Math.min(remainingProceeds, amountToRepay);

        let debtDist = Array.from(distributions.values()).find(d => d.stakeholderName === debt.lenderName);
        if(!debtDist) {
            const key = `debt-${debt.id}`;
            distributions.set(key, { stakeholderId: key, stakeholderName: debt.lenderName, shareClassId: 'debt', shareClassName: 'Debt', initialInvestment: debt.amount, fromDebtRepayment: 0, fromLiquidationPreference: 0, fromParticipation: 0, fromConvertedShares: 0, totalProceeds: 0, multiple: 0 });
            debtDist = distributions.get(key);
        }
        if (debtDist) debtDist.fromDebtRepayment += payment;

        remainingProceeds -= payment;
        calculationLog.push(`Paid ${formatCurrency(payment)} to debt holder ${debt.lenderName} (${debt.seniority}). Owed: ${formatCurrency(amountToRepay)}. Remaining: ${formatCurrency(remainingProceeds)}`);
    }

    // --- 2. Liquidation Preferences ---
    calculationLog.push(`--- Phase 2: Liquidation Preferences ---`);
    const rankedShareClasses = [...allShareClasses.values()]
        .filter(sc => sc.liquidationPreferenceRank > 0)
        .sort((a, b) => a.liquidationPreferenceRank - b.liquidationPreferenceRank);

    for (const sc of rankedShareClasses) {
        if (remainingProceeds <= 0) break;

        const holdersOfClass = capTable.entries.filter(e => e.shareClassId === sc.id);
        const totalInvestmentInClass = holdersOfClass.reduce((sum, h) => sum + (h.initialInvestment || 0), 0);
        if (totalInvestmentInClass === 0) continue;

        const preferenceAmount = totalInvestmentInClass * sc.liquidationPreferenceFactor;
        const payment = Math.min(remainingProceeds, preferenceAmount);
        calculationLog.push(`Paying Rank ${sc.liquidationPreferenceRank} (${sc.name}): Owed=${formatCurrency(preferenceAmount)}, Available=${formatCurrency(payment)}.`);

        for (const holder of holdersOfClass) {
            const holderPayment = totalInvestmentInClass > 0 ? ((holder.initialInvestment || 0) / totalInvestmentInClass) * payment : 0;
            const dist = distributions.get(`${holder.stakeholderId}-${holder.shareClassId}`);
            if (dist) {
                 dist.fromLiquidationPreference += holderPayment;
                 calculationLog.push(`  - ${holder.stakeholderName} receives ${formatCurrency(holderPayment)}`);
            }
        }

        remainingProceeds -= payment;
        calculationLog.push(`Remaining after Rank ${sc.liquidationPreferenceRank}: ${formatCurrency(remainingProceeds)}`);
    }

    // --- 3. Participation & Common Stock Distribution ---
     calculationLog.push(`--- Phase 3: Participation & Common Stock ---`);
    if (remainingProceeds > 0) {
        // Here, we decide which preferred shares convert vs stay with their preference-only payout.
        // This is a simplification; in reality, it's an economic choice per shareholder.
        // Simplified rule: Non-participating shares are "paid off" by their preference and don't convert.
        const participatingEntries = capTable.entries.filter(entry => {
            const sc = allShareClasses.get(entry.shareClassId);
            return sc && (sc.liquidationPreferenceType !== 'NON_PARTICIPATING' || sc.liquidationPreferenceRank === 0);
        });

        const totalParticipatingShares = participatingEntries.reduce((sum, e) => sum + e.shares, 0);

        if (totalParticipatingShares > 0) {
            calculationLog.push(`Distributing remaining ${formatCurrency(remainingProceeds)} among ${formatCurrency(totalParticipatingShares)} common & participating shares.`);
            
            const proceedsToDistribute = remainingProceeds;
            let paidOutInLoop = 0;

            for (const entry of participatingEntries) {
                const sc = allShareClasses.get(entry.shareClassId)!;
                const dist = distributions.get(`${entry.stakeholderId}-${entry.shareClassId}`);
                if (!dist) continue;
                
                const proRataShare = (entry.shares / totalParticipatingShares) * proceedsToDistribute;
                let finalPayment = proRataShare;

                if (sc.liquidationPreferenceType === 'CAPPED_PARTICIPATING' && sc.participationCapFactor) {
                    const totalPaidSoFar = dist.fromLiquidationPreference + dist.fromParticipation;
                    const capAmount = dist.initialInvestment * sc.participationCapFactor;
                    const maxAdditionalPayment = Math.max(0, capAmount - totalPaidSoFar);
                    finalPayment = Math.min(proRataShare, maxAdditionalPayment);
                     if (finalPayment < proRataShare) {
                        calculationLog.push(`  - ${entry.stakeholderName} (${sc.name}) hit participation cap of ${sc.participationCapFactor}x. Payment limited to ${formatCurrency(finalPayment)}.`);
                    }
                }
                
                if (sc.liquidationPreferenceRank === 0) {
                    dist.fromConvertedShares += finalPayment;
                } else {
                    dist.fromParticipation += finalPayment;
                }
                paidOutInLoop += finalPayment;
                 calculationLog.push(`  - ${entry.stakeholderName} (${sc.name}) receives pro-rata payment of ${formatCurrency(finalPayment)}.`);
            }
            remainingProceeds -= paidOutInLoop;
             calculationLog.push(`Final remaining value after participation: ${formatCurrency(remainingProceeds)}.`);
        } else {
            calculationLog.push(`No participating shares left. ${formatCurrency(remainingProceeds)} remains undistributed.`);
        }
    } else {
        calculationLog.push(`No proceeds left for common or participating shares.`);
    }
    
    const finalDistributions = Array.from(distributions.values());
    finalDistributions.forEach(dist => {
        dist.totalProceeds = dist.fromDebtRepayment + dist.fromLiquidationPreference + dist.fromParticipation + dist.fromConvertedShares;
        dist.multiple = dist.initialInvestment > 0 ? dist.totalProceeds / dist.initialInvestment : 0;
    });
    
    return {
        netExitProceeds,
        distributions: finalDistributions.filter(d => d.totalProceeds > 0 || d.initialInvestment > 0),
        remainingValue: remainingProceeds,
        calculationLog,
    };
};

export const calculateTotalCapitalization = (
    transactions: Transaction[],
    capTable: CapTable,
    asOfDate: string,
    t: Translations,
    locale: string,
    projectCurrency: string
): TotalCapitalizationResult => {
    const entries: TotalCapitalizationEntry[] = [];
    let totalValue = 0;

    // 1. Equity from Cap Table
    capTable.entries.forEach(entry => {
        const value = entry.initialInvestment || 0;
        entries.push({
            key: `equity-${entry.stakeholderId}-${entry.shareClassId}`,
            stakeholderName: entry.stakeholderName,
            instrumentName: entry.shareClassName,
            instrumentType: 'Equity',
            amountOrShares: `${entry.shares.toLocaleString(locale)}`,
            value: value,
        });
        totalValue += value;
    });

    // Determine converted loans
    const convertedLoanIds = new Set<string>();
    transactions
        .filter(tx => tx.type === TransactionType.FINANCING_ROUND && new Date(tx.date) <= new Date(asOfDate) && tx.status === 'ACTIVE')
        .forEach(tx => {
            (tx as FinancingRoundTransaction).convertsLoanIds?.forEach(id => convertedLoanIds.add(id));
        });

    // 2. Hybrid Capital (Unconverted Convertible Loans)
    transactions
        .filter(tx => 
            tx.type === TransactionType.CONVERTIBLE_LOAN && 
            tx.status === 'ACTIVE' && 
            new Date(tx.validFrom) <= new Date(asOfDate) &&
            (!tx.validTo || new Date(tx.validTo) > new Date(asOfDate)) &&
            !convertedLoanIds.has(tx.id)
        )
        .forEach(tx => {
            const loan = tx as ConvertibleLoanTransaction;
            const interest = calculateAccruedInterest(loan, asOfDate);
            const value = loan.amount + interest;
            entries.push({
                key: `hybrid-${loan.id}`,
                stakeholderName: loan.investorName,
                instrumentName: `${t.convertibleLoan} (${loan.date})`,
                instrumentType: 'Hybrid',
                amountOrShares: loan.amount.toLocaleString(locale),
                value: value,
                valueBreakdown: { principal: loan.amount, interest },
            });
            totalValue += value;
        });

    // 3. Debt Capital
    transactions
        .filter(tx => 
            tx.type === TransactionType.DEBT_INSTRUMENT && 
            tx.status === 'ACTIVE' && 
            new Date(tx.validFrom) <= new Date(asOfDate) &&
            (!tx.validTo || new Date(tx.validTo) > new Date(asOfDate))
        )
        .forEach(tx => {
            const debt = tx as DebtInstrumentTransaction;
            const interest = calculateAccruedInterest(debt, asOfDate);
            const value = debt.amount + interest;
            entries.push({
                key: `debt-${debt.id}`,
                stakeholderName: debt.lenderName,
                instrumentName: `${t.debtInstrument} (${debt.date})`,
                instrumentType: 'Debt',
                amountOrShares: debt.amount.toLocaleString(locale),
                value: value,
                valueBreakdown: { principal: debt.amount, interest },
            });
            totalValue += value;
        });

    return { entries, totalValue, currency: projectCurrency };
};


export const calculateCashflow = (
    transactions: Transaction[],
    asOfDate: string,
    t: Translations,
    projectCurrency: string
): CashflowResult => {
    const relevantTxs = transactions
        .filter(tx => tx.status === TransactionStatus.ACTIVE && new Date(tx.date) <= new Date(asOfDate))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let balance = 0;
    const entries: CashflowEntry[] = [];

    for (const tx of relevantTxs) {
        let cashIn = 0;
        const cashOut = 0; // Currently no cash-out transactions
        let description = '';

        switch (tx.type) {
            case TransactionType.FOUNDING: {
                cashIn = tx.shareholdings.reduce((sum, sh) => sum + (sh.investment || 0), 0);
                description = `${t.founding}: ${tx.companyName}`;
                break;
            }
            case TransactionType.FINANCING_ROUND: {
                cashIn = tx.newShareholdings.reduce((sum, sh) => sum + (sh.investment || 0), 0);
                description = `${t.financingRound}: ${tx.roundName}`;
                break;
            }
            case TransactionType.CONVERTIBLE_LOAN: {
                cashIn = tx.amount;
                description = `${t.convertibleLoan}: ${tx.investorName}`;
                break;
            }
            case TransactionType.DEBT_INSTRUMENT: {
                cashIn = tx.amount;
                description = `${t.debtInstrument}: ${tx.lenderName}`;
                break;
            }
            case TransactionType.EQUALIZATION_PURCHASE: {
                const eqTx = tx as EqualizationPurchaseTransaction;
                const baseInvestment = eqTx.purchasedShares * eqTx.pricePerShare;
                const referenceTx = relevantTxs.find(t => t.id === eqTx.referenceTransactionId);
                let equalizationInterest = 0;
                if (referenceTx) {
                    const startDate = new Date(referenceTx.date);
                    const endDate = new Date(eqTx.date);
                    if (endDate > startDate) {
                        const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                        equalizationInterest = baseInvestment * eqTx.equalizationInterestRate * years;
                    }
                }
                cashIn = baseInvestment + equalizationInterest;
                description = `${t.equalizationPurchase}: ${eqTx.newStakeholderName}`;
                break;
            }
            default:
                // Other transactions have no direct cash impact on the company
                continue;
        }

        if (cashIn > 0 || cashOut > 0) {
            balance += cashIn - cashOut;
            entries.push({
                key: tx.id,
                date: tx.date,
                description,
                cashIn,
                cashOut,
                balance
            });
        }
    }

    return { entries, finalBalance: balance, currency: projectCurrency };
};


export const assessProject = (
    transactions: Transaction[],
    capTable: CapTable,
    t: Translations
): ProjectAssessmentResult => {
    const findings: AssessmentFinding[] = [];
    const asOfDate = capTable.asOfDate;
    const allShareClasses = getShareClassesAsOf(transactions, asOfDate);
    const foundingTx = transactions.find(tx => tx.type === TransactionType.FOUNDING) as FoundingTransaction | undefined;

    // Check 1: Founder Vesting
    if (foundingTx) {
        const founders = new Set(foundingTx.shareholdings.map(sh => sh.stakeholderId));
        capTable.entries.forEach(entry => {
            if (founders.has(entry.stakeholderId) && !entry.vestingScheduleId) {
                findings.push({
                    severity: 'danger',
                    title: t.projectAssessment.findingFounderNoVestingTitle,
                    description: t.projectAssessment.findingFounderNoVestingDesc.replace('{stakeholderName}', entry.stakeholderName)
                });
            }
        });
        const hasStandardVesting = capTable.entries.some(entry => {
            if (!entry.vestingScheduleId) return false;
            const vestingSchedules = getVestingSchedulesAsOf(transactions, asOfDate);
            const schedule = vestingSchedules.get(entry.vestingScheduleId);
            return schedule && schedule.vestingPeriodMonths === 48 && schedule.cliffMonths === 12;
        });
        if (hasStandardVesting) {
            findings.push({
                severity: 'info',
                title: t.projectAssessment.findingStandardVestingTitle,
                description: t.projectAssessment.findingStandardVestingDesc
            });
        }
    }

    // Check 2: Share Class Terms
    allShareClasses.forEach(sc => {
        if (sc.liquidationPreferenceFactor > 2) {
            findings.push({
                severity: 'warning',
                title: t.projectAssessment.findingAggressiveLiqPrefTitle,
                description: t.projectAssessment.findingAggressiveLiqPrefDesc.replace('{shareClassName}', sc.name).replace('{factor}', String(sc.liquidationPreferenceFactor))
            });
        }
        if (sc.antiDilutionProtection === 'FULL_RATCHET') {
            findings.push({
                severity: 'warning',
                title: t.projectAssessment.findingFullRatchetTitle,
                description: t.projectAssessment.findingFullRatchetDesc.replace('{shareClassName}', sc.name)
            });
        }
    });

    // Check 3: Down Rounds
    const financingRounds = transactions
        .filter(tx => tx.type === TransactionType.FINANCING_ROUND && tx.status === 'ACTIVE' && new Date(tx.date) <= new Date(asOfDate))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) as FinancingRoundTransaction[];

    let lastPostMoney = -1;
    financingRounds.forEach(round => {
        const totalInvestment = round.newShareholdings.reduce((sum, sh) => sum + (sh.investment || 0), 0);
        const postMoney = round.preMoneyValuation + totalInvestment;
        if (lastPostMoney > 0 && round.preMoneyValuation < lastPostMoney) {
             findings.push({
                severity: 'warning',
                title: t.projectAssessment.findingDownRoundTitle,
                description: t.projectAssessment.findingDownRoundDesc.replace('{roundName}', round.roundName).replace('{preMoney}', postMoney.toLocaleString())
            });
        }
        lastPostMoney = postMoney;
    });

    // Remove duplicate findings by title
    const uniqueFindings = Array.from(new Map(findings.map(item => [item.title, item])).values());
    
    // Add an info finding if no issues were found
    if (uniqueFindings.length === 0) {
         findings.push({
            severity: 'info',
            title: t.projectAssessment.noIssuesFoundTitle,
            description: t.projectAssessment.noIssuesFoundDesc
        });
    }

    return { asOfDate, findings: uniqueFindings };
};

export const summarizeWaterfallByStakeholder = (waterfallResult: WaterfallResult): StakeholderPayoutSummaryResult => {
    const summaryMap = new Map<string, { name: string; totalInvestment: number; totalPayout: number }>();

    for (const dist of waterfallResult.distributions) {
        if (!summaryMap.has(dist.stakeholderId)) {
            summaryMap.set(dist.stakeholderId, { name: dist.stakeholderName, totalInvestment: 0, totalPayout: 0 });
        }
        const entry = summaryMap.get(dist.stakeholderId)!;
        entry.totalInvestment += dist.initialInvestment;
        entry.totalPayout += dist.totalProceeds;
    }

    const totalPayoutSum = Array.from(summaryMap.values()).reduce((sum, s) => sum + s.totalPayout, 0);

    const entries: StakeholderPayoutSummaryEntry[] = Array.from(summaryMap.entries()).map(([id, data]) => ({
        stakeholderId: id,
        stakeholderName: data.name,
        totalPayout: data.totalPayout,
        multipleOnInvestment: data.totalInvestment > 0 ? data.totalPayout / data.totalInvestment : 0,
        percentageOfTotal: totalPayoutSum > 0 ? (data.totalPayout / totalPayoutSum) * 100 : 0,
    }));

    entries.sort((a, b) => b.totalPayout - a.totalPayout);
    
    return { entries };
};
