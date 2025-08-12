// POS API Type Definitions based on EG Retail Swagger API

// === SHARED TYPES ===
export interface ItemIdentifier {
  sku?: string;
  productId?: string;
  useItemIdentifiersOnlyForIdentification?: boolean;
  gtin?: string;
  externalItemNo?: string;
}

export interface StoreIdentifier {
  storeNumber?: number;
}

// === POS API TYPES ===
export interface APIKeyConfig {
  apiKey: string;
}

export interface StoreConfig {
  storeNum: number;
  storeNumType: string;
}

export interface StoreIdentificator {
  storenum: number;
  storeNumType: string;
}

export interface CartIdentificator {
  id: string;
  revision: number;
  hashBasedMessageAuthenticationCode: string;
}

export interface ItemInfo {
  ean: string;
  quantity: number;
}

export interface ItemSaleRequest {
  apiKey: string;
  cartType: string;
  storeIdentificator: StoreIdentificator;
  physicalStoreIdentificator: StoreIdentificator;
  items: ItemInfo[];
}

export interface AddItemRequest {
  cartId: CartIdentificator;
  ean: string;
  quantity: number;
}

export interface Article {
  ean: string;
  text: string;
  normalPrice: number;
  colorText?: string;
  colorCode?: string;
  sizeText?: string;
  modelId?: string;
  productInformation?: string;
  mediaId?: string;
  timeRequirementStart?: string;
  timeRequirementEnd?: string;
  ageRequirement: number;
  individNumber?: string;
  serialNumber?: string;
  fullText?: string;
  scripInfo?: string;
  scanCode?: string;
  mainEAN?: string;
  netCost: number;
  isOpenPrice: boolean;
  expirationDate?: string;
  colorId?: string;
  hasGiftReceipt: boolean;
  isSecurityTagged: boolean;
  includedInMultiPack: boolean;
  provider?: string;
}

export interface CartItemQuantity {
  quantity: number;
  unitOfMeasure: string;
  unitOfMeasureText: string;
  dividingFactor: number;
  quantityInBaseUOM: number;
}

export interface CartItem {
  article: Article;
  cartItemIdentificator: number;
  quantity: CartItemQuantity;
  discountContributions: any[];
  discountDetails: any[];
  notes: any[];
  total: {
    totalItemPrice: number;
    totalDiscountAmount: number;
    totalNetItemPrice: number;
  };
  vat: {
    vatPercent: number;
    vatAmount: number;
  };
  shoppingChannel: string;
}

export interface Cart {
  startTime: string;
  sequenceNumber: number;
  items: CartItem[];
  id: CartIdentificator;
  cartId: CartIdentificator;  // Added: actual API response has cartId property
  barCodeData: string;
  vaTs: any[];
  customerOrderNumber?: string;
  tracingId: string;
  externalOrderNumber: number;
  subtotal: number;
  totalDiscountAmount: number;
  grandTotal: number;
  customer?: any;
  operator?: string;
  loyalty?: any;
  payments: any[];
  cartType: string;
  storeIdentificator: StoreIdentificator;
  physicalStoreIdentificator: StoreIdentificator;
  tickets?: any[];
  boardingPassAndFlightInfo?: any;
  isSealingRequired?: boolean;
}

export interface ItemSaleResponse {
  cart: Cart;
  cartItemIdentificators: number[];
}

export interface CartResponse {
  success: boolean;
  cart?: Cart;
  cartItemIdentificators?: number[];
  error?: string;
  message: string;
}

// Environment configuration
export type POSEnvironment = 'dev' | 'test' | 'prod';

export interface EnvironmentConfig {
  dev: string;
  test: string;
  prod: string;
}

// Configuration types for the POS API service
export interface POSConfig {
  bearerToken?: string;
  apiKey: string;
  storeNum: number;
  environment: POSEnvironment;
  baseURL: string;
}

// === ITEM SERVICE API TYPES ===

// Item Service Request/Response Types
export interface GetItemsByIdentifiersRequest {
  itemIdentifiers: ItemIdentifier[];
}

export interface GetItemsByIdentifiersResult {
  items: Item[];
}

export interface ItemStorePriceRequest {
  itemIdentifier: ItemIdentifier;
  storeIdentifier: StoreIdentifier;
}

export interface ItemStorePricesResponse {
  prices: ItemPrice[];
}

// Item Service Core Types
export interface Item {
  identifier?: ItemIdentifier;
  status?: ItemStatus;
  itemStatus?: string;
  modelNo?: string;
  color?: ColorInfo;
  size?: SizeInfo;
  displaySize?: string;
  variantSequenceNo?: number;
  itemText?: string;
  labelText1?: string;
  labelText2?: string;
  itemReceiptText?: string;
  itemGroupNo?: string;
  vat?: VATInfo[];
  excludeFromPriceControl?: boolean;
  dutyFree?: boolean;
  sealingBag?: boolean;
  restricted?: boolean;
  origin?: boolean;
  weightControl?: boolean;
  unit?: string;
  packageCode?: string;
  canBeOrdered?: boolean;
  minOrderQty?: number;
  trackStockChangesForItem?: boolean;
  openPrice?: boolean;
  customsTariffNo?: string;
  specialGroupIdentifier?: SpecialGroupIdentifier;
  manufacturerIdentifier?: ManufacturerIdentifier;
  substitutionItem?: ItemIdentifier;
  itemCategory?: ItemCategory;
  eNStandard?: string;
  ecolabel?: string;
  ecological?: boolean;
  changeVat?: boolean;
  itemClassification?: ItemClassificationIdentifier;
  reportCategory?: ReportCategoryIdentifier;
  dangerousGoods?: boolean;
  aDRClassification?: string;
  countryOrigin?: string;
  customerDiscountAllowed?: boolean;
  addFreight?: boolean;
  itemSegment?: string;
  storeSubDepartment?: string;
  subCollection?: string;
  originalPlanningCode?: string;
  brand?: Brand;
  measures?: ItemMeasures;
  images?: ImageReference[];
  itemSuppliers?: ItemSupplier[];
  tradingUnitDetails?: TradingUnitDetails;
  packOut?: boolean;
  bundleContentItemReferences?: BundleItemReference[];
  bundleReferences?: BundleItemReference[];
  unitPriceUnit?: string;
  unitPriceFactor?: number;
  alcoholByVolumePercent?: number;
  stopSaleReasonCode?: string;
  isDefaultOrderUnit?: boolean;
  storeLocalAttributes?: StoreLocalAttributes[];
  localizedTexts?: { [key: string]: ItemLocalizedTexts };
  externalChanges?: string;
  qtyInPallet?: number;
  geneticallyModified?: boolean;
}

export interface ItemStatus {
  isDeactivated?: boolean;
  isDeleted?: boolean;
}

export interface ColorInfo {
  text?: string;
}

export interface SizeInfo {
  text?: string;
}

export interface VATInfo {
  code?: string;
  countryCode?: string;
}

export interface SpecialGroupIdentifier {
  code?: string;
  name?: string;
}

export interface ManufacturerIdentifier {
  code?: string;
  name?: string;
}

export interface ItemCategory {
  code?: string;
  name?: string;
}

export interface ItemClassificationIdentifier {
  name?: string;
  code?: string;
}

export interface ReportCategoryIdentifier {
  name?: string;
  code?: string;
}

export interface Brand {
  text?: string;
  externalNo?: string;
  brandCategory?: string;
}

export interface ItemMeasures {
  width?: Measure;
  depth?: Measure;
  height?: Measure;
  weight?: Measure;
  volume?: Measure;
}

export interface Measure {
  value?: number;
  unit?: string;
}

export interface ImageReference {
  uri?: string;
  role?: string;
}

export interface ItemSupplier {
  identifier?: SupplierIdentifier;
  storeGroupReference?: StoreGroupReference;
  isMain?: boolean;
  useOnlyForLookup?: boolean;
  supplierItemNo?: string;
  supplierModelNo?: string;
  supplierColorNumber?: string;
  supplierColorCode?: string;
  supplierColorText?: string;
  supplierSizeText?: string;
  subSupplierNo?: string;
  subSupplierItemNo?: string;
  reserveForPreOrders?: boolean;
  leadTimeDeliveryInDays?: number;
}

export interface SupplierIdentifier {
  gln?: string;
  externalNo?: string;
}

export interface StoreGroupReference {
  type?: string;
  reference?: string;
}

export interface TradingUnitDetails {
  consumerUnitIdentifier?: ItemIdentifier;
  breakBulk?: boolean;
  consumerUnitQty?: number;
}

export interface BundleItemReference {
  quantity?: number;
  item?: ItemIdentifier;
}

export interface StoreLocalAttributes {
  shelfLocations?: ShelfLocation[];
}

export interface ShelfLocation {
  number?: string;
  shelfAreaCode?: string;
  shelfTypeCode?: string;
  shelfArea?: { code?: string };
  shelfType?: { code?: string };
  isMain?: boolean;
  itemShelfLocationIsDeleted?: boolean;
}

export interface ItemLocalizedTexts {
  itemText?: string;
  labelText1?: string;
  labelText2?: string;
  itemReceiptText?: string;
}

export interface ItemPrice {
  itemIdentifier?: ItemIdentifier;
  storeGroup?: ItemPriceStoreGroupIdentifier;
  priceGuid?: string;
  fromDate?: string;
  toDate?: string;
  isFixedPrice?: boolean;
  wholesalePriceInSupplierCurrency?: Money;
  supplierDiscount?: PriceCalculationElement;
  retailerKickback?: PriceCalculationElement;
  localDiscount1?: PriceCalculationElement;
  localDiscount2?: PriceCalculationElement;
  calculatedBreakage?: PriceCalculationElement;
  netPrice?: Money;
  vat?: ItemPriceVat;
  salesPrice?: Money;
  recommendedRetailPrice?: Money;
  status?: ItemPriceStatus;
}

export interface ItemPriceStoreGroupIdentifier {
  code?: string;
  externalNo?: string;
  type?: StoreGroupType;
}

export interface Money {
  amount?: number;
  currencyCode?: string;
}

export interface PriceCalculationElement {
  percentage?: number;
  amount?: number;
}

export interface ItemPriceVat {
  code?: string;
  rate?: number;
}

export type ItemPriceStatus = 'Active' | 'Deleted' | 'DeleteAllFuture' | 'Override';
export type StoreGroupType = 'Private' | 'Profile' | 'PriceZone';

// Item Service Configuration
export interface ItemServiceConfig {
  bearerToken?: string;
  environment: POSEnvironment;
  baseURL: string;
}

// Error response structure
export interface POSApiError {
  Type: string;
  Message: string;
  Details?: any;
}

// Training mode types
export interface TrainingModeConfig {
  enabled: boolean;
  useRealAPI: boolean;
  mockResponses: boolean;
}

// === PAYMENT & CHECKOUT TYPES ===
export interface PaymentReference {
  id: number;
  text: string;
  id2: string;
}

export interface Payment {
  paymentReferenceNumber: string;
  paymentIsAuthorizedOnly: boolean;
  cardIssuerIdentifier: string;
  cardName: string;
  uniqueCardHolderIdentifier: string;
  amount: number;
  type: 'CreditDebit' | 'Cash' | 'GiftCard' | 'Other';
  reference: PaymentReference;
  paymentAction: any; // Changed to any to allow different enum values
  printText: string;
  paymentTerminalType: any; // Changed to any to allow different enum values
}

export interface CheckoutRequest {
  payment: Payment;
  cartId: {
    id: string;
  };
}

export interface CheckoutResponse {
  success: boolean;
  transactionId?: string;
  receiptNumber?: string;
  error?: string;
  errorDetails?: POSApiError;
  payment?: Payment;
  totalAmount?: number;
}

// === ITEM SEARCH TYPES ===

export interface SearchableItem {
  id?: string;
  itemText?: string;
  brandName?: string;
  colorText?: string;
  sizeText?: string;
  externalItemNumber?: string;
  modelNo?: string;
  gtin?: string;
  supplierName?: string;
  alternativeGtins?: string;
  modelName?: string;
  externalModelNo?: string;
  manufacturerNo?: string;
  manufacturerName?: string;
  subSupplierNo?: string;
  subSupplierName?: string;
  supplierItemNoList?: string;
  supplierModelNoList?: string;
}

export interface SearchItemsWithDetails {
  searchableItems?: SearchableItem[];
  totalCount: number;
}

export interface FacetResult {
  code?: string;
  name?: string;
  count: number;
}

export interface HierarchicalFacetResult extends FacetResult {
  childFacets?: HierarchicalFacetResult[];
}

export interface FacetResults {
  departments?: HierarchicalFacetResult[];
  brands?: FacetResult[];
}

export interface AdvancedSearchItem {
  identifier?: ItemIdentifier;
  modelNo?: string;
  color?: {
    text?: string;
  };
  size?: {
    text?: string;
  };
  itemText?: string;
  labelText1?: string;
  labelText2?: string;
  itemReceiptText?: string;
  brandName?: string;
  departmentName?: string;
  areaName?: string;
  itemGroupName?: string;
  subGroupName?: string;
  currentOrdinaryPrice?: {
    amount: number;
  };
  currentPromotionPrice?: {
    amount: number;
  };
  currentEffectivePrice?: {
    amount: number;
  };
  availableInStore?: boolean;
  currentStockQuantityAvailable?: number;
  thumbnailUrl?: string;
}

export interface ItemSearchResult {
  results?: AdvancedSearchItem[];
  totalCount: number;
  facets?: FacetResults;
}
