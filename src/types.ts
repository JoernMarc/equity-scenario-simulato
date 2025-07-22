
export type Language = 'de' | 'en';

export enum TransactionType {
  FOUNDING = 'FOUNDING',
  CONVERTIBLE_LOAN = 'CONVERTIBLE_LOAN',
  FINANCING_ROUND = 'FINANCING_ROUND',
  EQUALIZATION_PURCHASE = 'EQUALIZATION_PURCHASE',
  DEBT_INSTRUMENT = 'DEBT_INSTRUMENT',
  UPDATE_SHARE_CLASS = 'UPDATE_SHARE_CLASS',
  SHARE_TRANSFER = 'SHARE_TRANSFER',
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

// --- Stakeholders ---
export interface Stakeholder {
  id: string;
  name: string;
}

// --- Vesting ---
export interface VestingSchedule {
  id:string;
  name: string;
  grantDate: string; // Start date of vesting
  vestingPeriodMonths: number; // e.g., 48 for 4 years
  cliffMonths: number; // e.g., 12 for 1 year
  acceleration?: 'SINGLE_TRIGGER' | 'DOUBLE_TRIGGER';
}


// --- Share Classes & Rights ---

export type LiquidationPreferenceType = 'NON_PARTICIPATING' | 'FULL_PARTICIPATING' | 'CAPPED_PARTICIPATING';
export type AntiDilutionProtection = 'NONE' | 'BROAD_BASED' | 'NARROW_BASED' | 'FULL_RATCHET';

export interface ShareClass {
  id: string; 
  name: string; 
  
  // Liquidation Preferences
  liquidationPreferenceRank: number; 
  liquidationPreferenceFactor: number; 
  liquidationPreferenceType: LiquidationPreferenceType;
  participationCapFactor?: number; 

  // Other Rights
  antiDilutionProtection: AntiDilutionProtection;
  votesPerShare: number;
  protectiveProvisions?: string[]; // e.g. ['SALE_OF_COMPANY', 'NEW_SENIOR_SHARES']
}

// --- Stakeholders & Holdings ---

export interface Shareholding {
  id: string;
  stakeholderId: string;
  stakeholderName: string; 
  shareClassId: string; 
  shares: number;
  investment?: number;
  originalPricePerShare?: number;
  vestingScheduleId?: string;
}


// --- Transactions ---

export interface BaseTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  status: TransactionStatus;
  validFrom: string; // YYYY-MM-DD
  validTo?: string; // YYYY-MM-DD
}

export interface FoundingTransaction extends BaseTransaction {
  type: TransactionType.FOUNDING;
  companyName: string;
  legalForm: string;
  currency?: string;
  shareClasses: ShareClass[];
  shareholdings: Shareholding[];
  vestingSchedules?: VestingSchedule[];
}

export enum ConversionMechanism {
  CAP_AND_DISCOUNT = 'CAP_AND_DISCOUNT',
  FIXED_PRICE = 'FIXED_PRICE',
  FIXED_RATIO = 'FIXED_RATIO',
}

export interface ConvertibleLoanTransaction extends BaseTransaction {
  type: TransactionType.CONVERTIBLE_LOAN;
  investorName: string;
  stakeholderId: string;
  amount: number;
  interestRate?: number; // p.a., e.g., 0.08 for 8%
  
  conversionMechanism: ConversionMechanism;

  // Fields for CAP_AND_DISCOUNT
  valuationCap?: number;
  discount?: number; // as a decimal, e.g., 0.2 for 20%
  
  // Field for FIXED_PRICE
  fixedConversionPrice?: number;
  
  // Fields for FIXED_RATIO
  ratioShares?: number;
  ratioAmount?: number;
  
  seniority: 'SENIOR_UNSECURED' | 'SUBORDINATED';
}

export interface FinancingRoundTransaction extends BaseTransaction {
  type: TransactionType.FINANCING_ROUND;
  roundName: string;
  preMoneyValuation: number;
  newShareClass: ShareClass; 
  newShareholdings: Shareholding[]; 
  convertsLoanIds?: string[]; 
}

export interface EqualizationPurchaseTransaction extends BaseTransaction {
  type: TransactionType.EQUALIZATION_PURCHASE;
  
  newStakeholderId: string;
  newStakeholderName: string;
  
  // Details zum Kauf
  purchasedShares: number;
  shareClassId: string; // Welche Anteilsklasse wird gekauft?
  pricePerShare: number; // Der "nackte" Preis pro Anteil
  
  // Die Equalization-Komponente
  equalizationInterestRate: number; // z.B. 0.08 für 8% p.a.
  referenceTransactionId: string; // Auf welche frühere Runde/Transaktion bezieht sich der Ausgleich?
}

export interface ShareTransferTransaction extends BaseTransaction {
  type: TransactionType.SHARE_TRANSFER;
  
  sellerStakeholderId: string; // Who is selling?
  buyerStakeholderId: string;  // Who is buying?
  buyerStakeholderName: string; // Name of the buyer, especially if they are new.
  
  shareClassId: string; // Which class of shares is being transferred?
  numberOfShares: number; // How many shares?
  pricePerShare: number; // At what price?
  
  // Optional field to capture things like an equalization interest payment
  additionalPayment?: { amount: number; description: string; };
}

export interface DebtInstrumentTransaction extends BaseTransaction {
  type: TransactionType.DEBT_INSTRUMENT;
  
  lenderName: string;
  amount: number;
  interestRate: number; // p.a. e.g. 0.05 for 5%
  seniority: 'SENIOR_SECURED' | 'SENIOR_UNSECURED' | 'SUBORDINATED';
}

export interface UpdateShareClassTransaction extends BaseTransaction {
  type: TransactionType.UPDATE_SHARE_CLASS;
  shareClassIdToUpdate: string;
  updatedProperties: Partial<Omit<ShareClass, 'id'>>;
}

export type Transaction = 
  | FoundingTransaction 
  | ConvertibleLoanTransaction 
  | FinancingRoundTransaction
  | EqualizationPurchaseTransaction
  | ShareTransferTransaction
  | DebtInstrumentTransaction
  | UpdateShareClassTransaction;


// --- Voting Simulation Result Types ---
export interface VoteDistributionEntry {
  stakeholderName: string;
  shareClassName: string;
  votes: number;
  percentage: number;
}

export interface VotingResult {
  asOfDate: string;
  totalVotes: number;
  voteDistribution: VoteDistributionEntry[];
}

// --- Result Types for future calculations ---

export interface CapTableEntry {
  stakeholderId: string;
  stakeholderName: string;
  shareClassId: string;
  shareClassName: string;
  shares: number; // Total shares for this entry
  vestedShares: number;
  percentage: number; // e.g., 15.5 for 15.5%
  initialInvestment?: number;
  vestingScheduleId?: string;
}

export interface CapTable {
  asOfDate: string;
  totalShares: number;
  totalVestedShares: number;
  entries: CapTableEntry[];
}

// --- Waterfall Analysis Result Types ---

export interface WaterfallDistribution {
  stakeholderId: string;
  stakeholderName: string;
  shareClassId: string;
  shareClassName: string;
  initialInvestment: number; // The original investment for the multiple calculation
  
  // Breakdown of proceeds
  fromDebtRepayment: number;
  fromLiquidationPreference: number;
  fromParticipation: number;
  fromConvertedShares: number;
  
  // Total result
  totalProceeds: number;
  multiple: number; // totalProceeds / initialInvestment
}

export interface WaterfallResult {
  netExitProceeds: number;
  distributions: WaterfallDistribution[];
  remainingValue: number; // Should be 0 at the end
  calculationLog: string[];
}

// --- Stakeholder Payout Summary ---
export interface StakeholderPayoutSummaryEntry {
    stakeholderId: string;
    stakeholderName: string;
    totalPayout: number;
    multipleOnInvestment: number;
    percentageOfTotal: number;
}
export interface StakeholderPayoutSummaryResult {
    entries: StakeholderPayoutSummaryEntry[];
}


// --- Total Capitalization Types ---
export type TotalCapitalizationInstrumentType = 'Equity' | 'Hybrid' | 'Debt';

export interface TotalCapitalizationEntry {
  key: string;
  stakeholderName: string;
  instrumentName: string; // e.g., "Common Stock" or "Convertible Loan 2023-10-26"
  instrumentType: TotalCapitalizationInstrumentType;
  amountOrShares: string; // Formatted string, e.g., "25,000" or "€50,000"
  value: number;
  valueBreakdown?: {
    principal: number;
    interest: number;
  };
}

export interface TotalCapitalizationResult {
  entries: TotalCapitalizationEntry[];
  totalValue: number;
  currency: string;
}

// --- Cashflow Types ---
export interface CashflowEntry {
  key: string;
  date: string;
  description: string;
  cashIn: number;
  cashOut: number;
  balance: number;
}

export interface CashflowResult {
  entries: CashflowEntry[];
  finalBalance: number;
  currency: string;
}

// --- Project Assessment Types ---
export type AssessmentFindingSeverity = 'danger' | 'warning' | 'info';

export interface AssessmentFinding {
  severity: AssessmentFindingSeverity;
  title: string;
  description: string;
}

export interface ProjectAssessmentResult {
  asOfDate: string;
  findings: AssessmentFinding[];
}

// --- Sample Scenarios ---
export interface SampleScenario {
  id: string;
  titleKey: string;
  descriptionKey: string;
  data: {
    projectName: string;
    transactions: Transaction[];
    stakeholders: Stakeholder[];
  };
}

// --- Project & Import/Export ---
export interface Project {
  id: string;
  name: string;
  currency: string;
  transactions: Transaction[];
  stakeholders: Stakeholder[];
}

export interface ParsedImportData {
  projectName: string;
  transactions: Transaction[];
  stakeholders: Stakeholder[];
}

// --- Accessibility & UI ---
export const FONT_SIZES = ['xs', 'sm', 'base', 'lg', 'xl'] as const;
export type FontSize = typeof FONT_SIZES[number];

export const THEMES = ['classic', 'modern', 'contrast'] as const;
export type Theme = typeof THEMES[number];

export type LegalTab = 'impressum' | 'privacy' | 'disclaimer';
