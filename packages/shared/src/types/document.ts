// ---------------------------------------------------------------------------
// Document management & AI extraction types
// ---------------------------------------------------------------------------

export enum DocumentCategory {
  REGISTRATION = "REGISTRATION",
  COGGINS = "COGGINS",
  HEALTH_CERTIFICATE = "HEALTH_CERTIFICATE",
  INSURANCE = "INSURANCE",
  OWNERSHIP = "OWNERSHIP",
  SHIPPING = "SHIPPING",
  VET_RECORD = "VET_RECORD",
  LAB_RESULT = "LAB_RESULT",
  INVOICE = "INVOICE",
  CONTRACT = "CONTRACT",
  LICENSE = "LICENSE",
  OTHER = "OTHER",
}

export enum DocumentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  EXTRACTED = "EXTRACTED",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export enum ExtractionConfidence {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export interface ExtractedField {
  key: string;
  value: string;
  confidence: ExtractionConfidence;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface Document {
  id: string;
  organizationId: string;
  horseId: string | null;
  uploadedBy: string;
  category: DocumentCategory;
  status: DocumentStatus;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
  expiresAt: Date | null;
  extractedFields: ExtractedField[];
  extractionModel: string | null;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentListItem
  extends Pick<
    Document,
    | "id"
    | "horseId"
    | "category"
    | "status"
    | "title"
    | "fileType"
    | "expiresAt"
    | "createdAt"
  > {
  horseName: string | null;
  uploadedByName: string;
  isExpiringSoon: boolean;
}

export interface UploadDocumentInput {
  organizationId: string;
  horseId?: string;
  category: DocumentCategory;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
  expiresAt?: Date | string;
  tags?: string[];
}

export interface VerifyDocumentInput {
  documentId: string;
  verifiedBy: string;
  extractedFieldOverrides?: { key: string; value: string }[];
}
