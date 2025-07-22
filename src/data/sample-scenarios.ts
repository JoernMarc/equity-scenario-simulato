import type { SampleScenario } from '../types';
import { TransactionType, TransactionStatus, ConversionMechanism } from '../types';

export const sampleScenarios: SampleScenario[] = [
  {
    id: 'seed-round-scenario',
    titleKey: 'scenarioSeedRoundTitle',
    descriptionKey: 'scenarioSeedRoundDescription',
    data: {
      projectName: 'Web Widgets Inc.',
      stakeholders: [
        { id: 'founder-a', name: 'Founder A' },
        { id: 'founder-b', name: 'Founder B' },
        { id: 'angel-a', name: 'Angel Investor A' },
        { id: 'vc-a', name: 'VC A' }
      ],
      transactions: [
        {
          id: 'tx-1',
          type: TransactionType.FOUNDING,
          date: '2023-01-01',
          status: TransactionStatus.ACTIVE,
          validFrom: '2023-01-01',
          companyName: 'Web Widgets Inc.',
          legalForm: 'GmbH',
          currency: 'EUR',
          shareClasses: [
            { id: 'sc-common', name: 'Common Stock', liquidationPreferenceRank: 0, liquidationPreferenceFactor: 1, liquidationPreferenceType: 'NON_PARTICIPATING', antiDilutionProtection: 'NONE', votesPerShare: 1, protectiveProvisions: [] }
          ],
          shareholdings: [
            { id: 'sh-1', stakeholderId: 'founder-a', stakeholderName: 'Founder A', shareClassId: 'sc-common', shares: 800000, investment: 8000, vestingScheduleId: 'vs-1' },
            { id: 'sh-2', stakeholderId: 'founder-b', stakeholderName: 'Founder B', shareClassId: 'sc-common', shares: 200000, investment: 2000 }
          ],
          vestingSchedules: [
            { id: 'vs-1', name: 'Alices 4-Year Vest', grantDate: '2023-01-01', vestingPeriodMonths: 48, cliffMonths: 12, acceleration: undefined }
          ]
        },
        {
          id: 'tx-2',
          type: TransactionType.CONVERTIBLE_LOAN,
          date: '2023-06-01',
          status: TransactionStatus.ACTIVE,
          validFrom: '2023-06-01',
          investorName: 'Angel Investor A',
          stakeholderId: 'angel-a',
          amount: 100000,
          interestRate: 0.08,
          conversionMechanism: ConversionMechanism.CAP_AND_DISCOUNT,
          valuationCap: 5000000,
          discount: 0.20,
          seniority: 'SUBORDINATED'
        },
        {
          id: 'tx-3',
          type: TransactionType.FINANCING_ROUND,
          date: '2024-01-01',
          status: TransactionStatus.ACTIVE,
          validFrom: '2024-01-01',
          roundName: 'Seed Round',
          preMoneyValuation: 8000000,
          newShareClass: {
            id: 'sc-seed',
            name: 'Seed Preferred',
            liquidationPreferenceRank: 1,
            liquidationPreferenceFactor: 1,
            liquidationPreferenceType: 'NON_PARTICIPATING',
            antiDilutionProtection: 'BROAD_BASED',
            votesPerShare: 1,
            protectiveProvisions: ['Veto on Sale', 'Board Seat']
          },
          newShareholdings: [
            { id: 'sh-3', stakeholderId: 'vc-a', stakeholderName: 'VC A', shareClassId: 'sc-seed', shares: 0, investment: 1000000 }
          ],
          convertsLoanIds: ['tx-2']
        }
      ]
    }
  },
  {
    id: 'down-round-scenario',
    titleKey: 'scenarioDownRoundTitle',
    descriptionKey: 'scenarioDownRoundDescription',
    data: {
        projectName: 'DownRound Dynamics',
        stakeholders: [
            { id: 'founder-a', name: 'Founder A' },
            { id: 'vc-a', name: 'VC A' },
            { id: 'vc-b', name: 'VC B' }
        ],
        transactions: [
             {
                id: 'tx-d-1',
                type: TransactionType.FOUNDING,
                date: '2022-01-01',
                status: TransactionStatus.ACTIVE,
                validFrom: '2022-01-01',
                companyName: 'DownRound Dynamics',
                legalForm: 'GmbH',
                currency: 'EUR',
                shareClasses: [
                    { id: 'sc-d-common', name: 'Common Stock', liquidationPreferenceRank: 0, liquidationPreferenceFactor: 1, liquidationPreferenceType: 'NON_PARTICIPATING', antiDilutionProtection: 'NONE', votesPerShare: 1, protectiveProvisions: [] }
                ],
                shareholdings: [
                    { id: 'sh-d-1', stakeholderId: 'founder-a', stakeholderName: 'Founder A', shareClassId: 'sc-d-common', shares: 1000000, investment: 10000 }
                ],
            },
            {
                id: 'tx-d-2',
                type: TransactionType.FINANCING_ROUND,
                date: '2023-01-01',
                status: TransactionStatus.ACTIVE,
                validFrom: '2023-01-01',
                roundName: 'Series A',
                preMoneyValuation: 10000000,
                newShareClass: {
                    id: 'sc-series-a',
                    name: 'Series A Preferred',
                    liquidationPreferenceRank: 1,
                    liquidationPreferenceFactor: 1,
                    liquidationPreferenceType: 'NON_PARTICIPATING',
                    antiDilutionProtection: 'FULL_RATCHET', // Key feature
                    votesPerShare: 1,
                    protectiveProvisions: []
                },
                newShareholdings: [
                    { id: 'sh-d-2', stakeholderId: 'vc-a', stakeholderName: 'VC A', shareClassId: 'sc-series-a', shares: 0, investment: 2000000 }
                ]
            },
            {
                id: 'tx-d-3',
                type: TransactionType.FINANCING_ROUND,
                date: '2024-01-01',
                status: TransactionStatus.ACTIVE,
                validFrom: '2024-01-01',
                roundName: 'Series B (Down Round)',
                preMoneyValuation: 5000000, // Lower valuation
                newShareClass: {
                    id: 'sc-series-b',
                    name: 'Series B Preferred',
                    liquidationPreferenceRank: 2,
                    liquidationPreferenceFactor: 1,
                    liquidationPreferenceType: 'NON_PARTICIPATING',
                    antiDilutionProtection: 'NONE',
                    votesPerShare: 1,
                    protectiveProvisions: []
                },
                newShareholdings: [
                    { id: 'sh-d-3', stakeholderId: 'vc-b', stakeholderName: 'VC B', shareClassId: 'sc-series-b', shares: 0, investment: 1000000 }
                ]
            }
        ]
    }
  },
   {
    id: 'advanced-waterfall-scenario',
    titleKey: 'scenarioAdvancedWaterfallTitle',
    descriptionKey: 'scenarioAdvancedWaterfallDescription',
    data: {
        projectName: 'Complex Exit Co',
        stakeholders: [
            { id: 'founder-a', name: 'Founder A' },
            { id: 'vc-a', name: 'VC A' },
            { id: 'bank-a', name: 'Bank A' },
            { id: 'lender-a', name: 'Subordinated Lender A' },
        ],
        transactions: [
             {
                id: 'tx-w-1',
                type: TransactionType.FOUNDING,
                date: '2022-01-01',
                status: TransactionStatus.ACTIVE,
                validFrom: '2022-01-01',
                companyName: 'Complex Exit Co',
                legalForm: 'GmbH',
                currency: 'EUR',
                shareClasses: [
                    { id: 'sc-w-common', name: 'Common Stock', liquidationPreferenceRank: 0, liquidationPreferenceFactor: 1, liquidationPreferenceType: 'NON_PARTICIPATING', antiDilutionProtection: 'NONE', votesPerShare: 1, protectiveProvisions: [] }
                ],
                shareholdings: [
                    { id: 'sh-w-1', stakeholderId: 'founder-a', stakeholderName: 'Founder A', shareClassId: 'sc-w-common', shares: 1000000, investment: 10000 }
                ],
            },
            {
                id: 'tx-w-2',
                type: TransactionType.FINANCING_ROUND,
                date: '2023-01-01',
                status: TransactionStatus.ACTIVE,
                validFrom: '2023-01-01',
                roundName: 'Preferred Round',
                preMoneyValuation: 5000000,
                newShareClass: {
                    id: 'sc-w-pref',
                    name: 'Preferred Stock',
                    liquidationPreferenceRank: 1,
                    liquidationPreferenceFactor: 2,
                    liquidationPreferenceType: 'FULL_PARTICIPATING',
                    votesPerShare: 1,
                    antiDilutionProtection: 'NONE',
                    participationCapFactor: undefined,
                    protectiveProvisions: []
                },
                newShareholdings: [
                    { id: 'sh-w-2', stakeholderId: 'vc-a', stakeholderName: 'VC A', shareClassId: 'sc-w-pref', shares: 0, investment: 1000000 }
                ]
            },
            {
                id: 'tx-w-3',
                type: TransactionType.DEBT_INSTRUMENT,
                date: '2023-06-01',
                status: TransactionStatus.ACTIVE,
                validFrom: '2023-06-01',
                lenderName: 'Bank A',
                amount: 500000,
                interestRate: 0.06,
                seniority: 'SENIOR_SECURED'
            },
            {
                id: 'tx-w-4',
                type: TransactionType.DEBT_INSTRUMENT,
                date: '2023-09-01',
                status: TransactionStatus.ACTIVE,
                validFrom: '2023-09-01',
                lenderName: 'Subordinated Lender A',
                amount: 250000,
                interestRate: 0.12,
                seniority: 'SUBORDINATED'
            }
        ]
    }
  },
  {
    id: 'governance-scenario',
    titleKey: 'scenarioGovernanceTitle',
    descriptionKey: 'scenarioGovernanceDescription',
    data: {
        projectName: 'Control Corp',
        stakeholders: [
            { id: 'founder-a', name: 'Founder A' },
            { id: 'founder-b', name: 'Founder B' },
            { id: 'angel-a', name: 'Angel Investor A' }
        ],
        transactions: [
             {
                id: 'tx-g-1',
                type: TransactionType.FOUNDING,
                date: '2023-01-01',
                status: TransactionStatus.ACTIVE,
                validFrom: '2023-01-01',
                companyName: 'Control Corp',
                legalForm: 'GmbH',
                currency: 'EUR',
                shareClasses: [
                    { id: 'sc-g-common', name: 'Common', liquidationPreferenceRank: 0, liquidationPreferenceFactor: 1, liquidationPreferenceType: 'NON_PARTICIPATING', antiDilutionProtection: 'NONE', votesPerShare: 1, protectiveProvisions: [] }
                ],
                shareholdings: [
                    { id: 'sh-g-1', stakeholderId: 'founder-a', stakeholderName: 'Founder A', shareClassId: 'sc-g-common', shares: 500000, investment: 5000 },
                    { id: 'sh-g-2', stakeholderId: 'founder-b', stakeholderName: 'Founder B', shareClassId: 'sc-g-common', shares: 500000, investment: 5000 }
                ]
            },
            {
                id: 'tx-g-2',
                type: TransactionType.UPDATE_SHARE_CLASS,
                date: '2023-06-01',
                status: TransactionStatus.ACTIVE,
                validFrom: '2023-06-01',
                shareClassIdToUpdate: 'sc-g-common',
                updatedProperties: {
                    votesPerShare: 10
                }
            },
            {
                id: 'tx-g-3',
                type: TransactionType.SHARE_TRANSFER,
                date: '2024-01-01',
                status: TransactionStatus.ACTIVE,
                validFrom: '2024-01-01',
                sellerStakeholderId: 'founder-b',
                buyerStakeholderId: 'angel-a',
                buyerStakeholderName: 'Angel Investor A',
                shareClassId: 'sc-g-common',
                numberOfShares: 100000,
                pricePerShare: 5
            }
        ]
    }
  },
  {
    id: 'equalization-scenario',
    titleKey: 'scenarioEqualizationTitle',
    descriptionKey: 'scenarioEqualizationDescription',
    data: {
        projectName: 'Equalization Example',
        stakeholders: [
            { id: 'founder-a', name: 'Founder A' },
            { id: 'late-investor-a', name: 'Late Investor A' },
        ],
        transactions: [
             {
                id: 'tx-e-1',
                type: TransactionType.FOUNDING,
                date: '2023-01-01',
                status: TransactionStatus.ACTIVE,
                validFrom: '2023-01-01',
                companyName: 'Equalization Example',
                legalForm: 'GmbH',
                currency: 'EUR',
                shareClasses: [
                    { id: 'sc-e-common', name: 'Common Stock', liquidationPreferenceRank: 0, liquidationPreferenceFactor: 1, liquidationPreferenceType: 'NON_PARTICIPATING', antiDilutionProtection: 'NONE', votesPerShare: 1, protectiveProvisions: [] }
                ],
                shareholdings: [
                    { id: 'sh-e-1', stakeholderId: 'founder-a', stakeholderName: 'Founder A', shareClassId: 'sc-e-common', shares: 100000, investment: 10000, originalPricePerShare: 0.1 }
                ]
            },
            {
                id: 'tx-e-2',
                type: TransactionType.EQUALIZATION_PURCHASE,
                date: '2023-07-01',
                status: TransactionStatus.ACTIVE,
                validFrom: '2023-07-01',
                newStakeholderId: 'late-investor-a',
                newStakeholderName: 'Late Investor A',
                purchasedShares: 50000,
                shareClassId: 'sc-e-common',
                pricePerShare: 0.1,
                equalizationInterestRate: 0.10,
                referenceTransactionId: 'tx-e-1'
            }
        ]
    }
  }
];
