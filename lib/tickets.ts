import { supabase } from "./supabaseClient";
import { listExperts } from "./experts";
import type { EmergencyTicket, TicketCategory, TicketStatus } from "./types";

const LOCAL_KEY = "vlaw_emergency_tickets";
const LAST_KEY = "vlaw_last_ticket_id";
const GUEST_KEY = "vlaw_guest_profile";

export type GuestProfile = {
  full_name: string;
  phone: string;
  company_name?: string;
};

export function getLastTicketId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_KEY);
}

function setLastTicketId(id: string) {
  window.localStorage.setItem(LAST_KEY, id);
}

export function saveGuestProfile(profile: GuestProfile) {
  window.localStorage.setItem(GUEST_KEY, JSON.stringify(profile));
}

function guestProfile(): GuestProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as GuestProfile) : null;
  } catch {
    return null;
  }
}

function readLocal(): EmergencyTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as EmergencyTicket[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(tickets: EmergencyTicket[]) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(tickets));
}

async function currentProfileId() {
  if (!supabase) return null;
  const session = (await supabase.auth.getUser()).data.user;
  if (!session) return null;
  const { data } = await supabase.from("users").select("id").eq("id", session.id).maybeSingle();
  return data?.id ?? null;
}

function attachGuest(ticket: EmergencyTicket): EmergencyTicket {
  const guest = guestProfile();
  if (!guest || ticket.reporter_name) return ticket;
  return {
    ...ticket,
    reporter_name: guest.full_name,
    reporter_phone: guest.phone,
    company_name: guest.company_name,
  };
}

export async function listTickets(): Promise<EmergencyTicket[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("emergency_tickets")
      .select("*, assigned_expert:experts(*)")
      .order("created_at", { ascending: false });
    if (!error && data) {
      return (data as EmergencyTicket[]).map(attachGuest);
    }
  }
  return readLocal().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getTicket(id: string) {
  const tickets = await listTickets();
  return tickets.find((t) => t.id === id);
}

export async function uploadTicketMedia(files: File[]) {
  if (!files.length) return [] as string[];
  if (!supabase) {
    return Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );
  }

  const urls: string[] = [];
  for (const file of files) {
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("ticket-media").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("ticket-media").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export async function createTicket(input: {
  category: TicketCategory;
  location: string;
  description: string;
  media_urls: string[];
  reporter?: GuestProfile;
}): Promise<EmergencyTicket> {
  if (input.reporter) saveGuestProfile(input.reporter);

  const userId = await currentProfileId();
  const payload = {
    user_id: userId,
    category: input.category,
    location: input.location,
    description: input.description,
    media_urls: input.media_urls,
    status: "접수완료" as TicketStatus,
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("emergency_tickets")
      .insert(payload)
      .select("*, assigned_expert:experts(*)")
      .single();
    if (!error && data) {
      const ticket = attachGuest(data as EmergencyTicket);
      setLastTicketId(ticket.id);
      writeLocal([ticket, ...readLocal().filter((t) => t.id !== ticket.id)]);
      return ticket;
    }
  }

  const ticket: EmergencyTicket = {
    ...payload,
    id: crypto.randomUUID(),
    assigned_expert_id: null,
    created_at: new Date().toISOString(),
    reporter_name: input.reporter?.full_name,
    reporter_phone: input.reporter?.phone,
    company_name: input.reporter?.company_name,
    assigned_expert: null,
  };
  writeLocal([ticket, ...readLocal()]);
  setLastTicketId(ticket.id);
  return ticket;
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  if (supabase) {
    await supabase.from("emergency_tickets").update({ status }).eq("id", id);
  }
  writeLocal(
    readLocal().map((t) => (t.id === id ? { ...t, status } : t)),
  );
}

export async function assignExpert(id: string, expertId: string) {
  const patch = {
    assigned_expert_id: expertId,
    status: "담당자배정" as TicketStatus,
  };
  if (supabase) {
    await supabase.from("emergency_tickets").update(patch).eq("id", id);
  }
  const experts = await listExperts();
  const expert = experts.find((item) => item.id === expertId) ?? null;
  writeLocal(
    readLocal().map((t) =>
      t.id === id ? { ...t, ...patch, assigned_expert: expert } : t,
    ),
  );
}
