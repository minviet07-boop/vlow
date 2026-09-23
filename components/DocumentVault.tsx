"use client";

import { useEffect, useRef, useState } from "react";
import {
  addVaultDocument,
  listVaultDocuments,
  openVaultDocument,
} from "@/lib/vault";
import { DOC_TYPES, type DocType, type VaultDocument } from "@/lib/types";

const SAMPLE: VaultDocument[] = [
  {
    id: "sample-1",
    user_id: null,
    doc_type: "여권",
    file_name: "PASSPORT_WAN_HUH.pdf",
    file_url: "",
    uploaded_at: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "sample-2",
    user_id: null,
    doc_type: "사업자등록증",
    file_name: "ERC_TUDAK_VN.pdf",
    file_url: "",
    uploaded_at: "2026-09-05T00:00:00.000Z",
  },
];

function dateLabel(iso: string) {
  return iso.slice(0, 10);
}

export default function DocumentVault() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<DocType>("여권");
  const [documents, setDocuments] = useState<VaultDocument[]>(SAMPLE);

  async function refresh() {
    const rows = await listVaultDocuments();
    setDocuments(rows.length ? rows : SAMPLE);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await addVaultDocument(file, docType);
    await refresh();
  }

  return (
    <div className="my-4 rounded-xl border bg-white p-4 shadow-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-bold text-gray-700">🔒 안심 문서 보관함 (Secure Vault)</h3>
        <div className="flex items-center gap-2">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
            className="rounded-md border bg-white px-2 py-1 text-xs text-gray-700"
          >
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
          >
            + 서류 업로드
          </button>
          <input ref={inputRef} type="file" className="hidden" onChange={onFileChange} />
        </div>
      </div>
      <div className="divide-y">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between py-3">
            <div>
              <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                {doc.doc_type}
              </span>
              <span className="text-sm font-medium text-gray-800">{doc.file_name}</span>
              <p className="mt-0.5 text-xs text-gray-400">업로드일: {dateLabel(doc.uploaded_at)}</p>
            </div>
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
              disabled={!doc.file_url}
              onClick={() => openVaultDocument(doc)}
            >
              다운로드/공유
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
