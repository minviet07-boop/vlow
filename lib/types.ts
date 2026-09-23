export const TICKET_CATEGORIES = [
  "공안단속",
  "행정마찰",
  "비자체류",
  "기타분쟁",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_STATUSES = [
  "접수완료",
  "담당자배정",
  "관공서진행중",
  "해결완료",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const DOC_TYPES = ["여권", "사업자등록증", "비자/TRC", "계약서"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export type Expert = {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  is_available: boolean;
};

export type EmergencyTicket = {
  id: string;
  user_id: string | null;
  category: TicketCategory;
  location: string;
  description: string;
  media_urls: string[];
  status: TicketStatus;
  assigned_expert_id: string | null;
  created_at: string;
  reporter_name?: string;
  reporter_phone?: string;
  company_name?: string;
  assigned_expert?: Expert | null;
};

export type VaultDocument = {
  id: string;
  user_id: string | null;
  doc_type: DocType;
  file_name: string;
  file_url: string;
  uploaded_at: string;
};
