

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
  FinancingRoundTransaction
} from '../types';
import { TransactionType, ConversionMechanism, TransactionStatus } from '../types';

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
    const netExitProceeds = exitProceeds - transactionCosts;
    let remainingProceeds = netExitProceeds;
    calculationLog.push(`Starting with Net Exit Proceeds of ${netExitProceeds.toLocaleString(language)}`);

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
    
    // 1. Debt Repayment
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

        let debtDist = Array.from(distributions.values()).find(d => d.stakeholderName === debt.lenderName); // Simplified assumption
        if(!debtDist) {
            const key = `debt-${debt.id}`;
            distributions.set(key, { stakeholderId: key, stakeholderName: debt.lenderName, shareClassId: 'debt', shareClassName: 'Debt', initialInvestment: debt.amount, fromDebtRepayment: 0, fromLiquidationPreference: 0, fromParticipation: 0, fromConvertedShares: 0, totalProceeds: 0, multiple: 0 });
            debtDist = distributions.get(key);
        }
        if (debtDist) debtDist.fromDebtRepayment += payment;

        remainingProceeds -= payment;
        calculationLog.push(`Repaid ${payment.toLocaleString(language)} to debt holder ${debt.lenderName}. Remaining: ${remainingProceeds.toLocaleString(language)}`);
    }

    // 2. Liquidation Preferences
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

        for (const holder of holdersOfClass) {
            const holderPayment = totalInvestmentInClass > 0 ? ((holder.initialInvestment || 0) / totalInvestmentInClass) * payment : 0;
            const dist = distributions.get(`${holder.stakeholderId}-${holder.shareClassId}`);
            if (dist) dist.fromLiquidationPreference += holderPayment;
        }

        remainingProceeds -= payment;
        calculationLog.push(`Paid ${payment.toLocaleString(language)} for ${sc.liquidationPreferenceFactor}x preference to ${sc.name} holders. Remaining: ${remainingProceeds.toLocaleString(language)}`);
    }

    // 3. Participation & Common Stock Distribution
    if (remainingProceeds > 0) {
        const participatingEntries = capTable.entries.filter(entry => {
            const sc = allShareClasses.get(entry.shareClassId);
            // Simplification: Non-participating chose preference and are out. Real-world they might convert.
            return sc && (sc.liquidationPreferenceRank === 0 || sc.liquidationPreferenceType !== 'NON_PARTICIPATING');
        });

        const totalParticipatingShares = participatingEntries.reduce((sum, e) => sum + e.shares, 0);

        if (totalParticipatingShares > 0) {
            calculationLog.push(`Distributing remaining ${remainingProceeds.toLocaleString(language)} among ${totalParticipatingShares.toLocaleString(language)} common & participating shares.`);
            
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
                }
                
                if (sc.liquidationPreferenceRank === 0) {
                    dist.fromConvertedShares += finalPayment;
                } else {
                    dist.fromParticipation += finalPayment;
                }
                paidOutInLoop += finalPayment;
            }
            remainingProceeds -= paidOutInLoop;
        }
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