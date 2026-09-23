import { supabase } from "./supabaseClient";
import type { DocType, VaultDocument } from "./types";

const LOCAL_KEY = "vlaw_document_vault";

function readLocal(): VaultDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as VaultDocument[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(docs: VaultDocument[]) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(docs));
}

export async function listVaultDocuments(): Promise<VaultDocument[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("document_vault")
      .select("*")
      .order("uploaded_at", { ascending: false });
    if (!error && data) return data as VaultDocument[];
  }
  return readLocal().sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
}

export async function addVaultDocument(file: File, docType: DocType) {
  let userId: string | null = null;
  if (supabase) {
    const session = (await supabase.auth.getUser()).data.user;
    if (session) {
      const { data } = await supabase.from("users").select("id").eq("id", session.id).maybeSingle();
      userId = data?.id ?? null;
    }
  }
  let fileUrl = "";

  if (supabase) {
    const path = `${userId ?? "guest"}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("document-vault").upload(path, file);
    if (error) throw error;
    fileUrl = path;
    const row = {
      user_id: userId,
      doc_type: docType,
      file_name: file.name,
      file_url: fileUrl,
    };
    const { data, error: insertError } = await supabase
      .from("document_vault")
      .insert(row)
      .select("*")
      .single();
    if (!insertError && data) {
      writeLocal([data as VaultDocument, ...readLocal()]);
      return data as VaultDocument;
    }
  }

  fileUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const doc: VaultDocument = {
    id: crypto.randomUUID(),
    user_id: userId,
    doc_type: docType,
    file_name: file.name,
    file_url: fileUrl,
    uploaded_at: new Date().toISOString(),
  };
  writeLocal([doc, ...readLocal()]);
  return doc;
}

export async function openVaultDocument(doc: VaultDocument) {
  if (supabase && !doc.file_url.startsWith("data:")) {
    const { data, error } = await supabase.storage
      .from("document-vault")
      .createSignedUrl(doc.file_url, 60);
    if (error || !data?.signedUrl) throw error;
    window.open(data.signedUrl, "_blank");
    return;
  }
  window.open(doc.file_url, "_blank");
}

export async function deleteVaultDocument(doc: VaultDocument) {
  if (supabase) {
    if (!doc.file_url.startsWith("data:")) {
      await supabase.storage.from("document-vault").remove([doc.file_url]);
    }
    await supabase.from("document_vault").delete().eq("id", doc.id);
  }
  writeLocal(readLocal().filter((item) => item.id !== doc.id));
}
