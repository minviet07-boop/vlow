-- VLaw schema — run in the Supabase SQL editor.

-- 1. 사용자 테이블 (User)
create table public.users (
  id uuid references auth.users not null primary key,
  full_name text not null,
  phone text not null,
  company_name text,
  role text default 'client', -- 'client' 또는 'expert'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 전문가 테이블 (Expert)
create table public.experts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  specialty text not null, -- 예: '공안 트러블슈팅', '노동법/비자', '법인설립/세무'
  phone text not null,
  is_available boolean default true
);

-- 3. 긴급 사건 접수 테이블 (Emergency_Tickets)
create table public.emergency_tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id),
  category text not null, -- '공안단속', '행정마찰', '비자체류', '기타분쟁'
  location text not null, -- 현장 위치 (주소 또는 좌표)
  description text not null, -- 상황 설명
  media_urls text[], -- 증거 사진/영상 파일 URL 배열
  status text default '접수완료', -- '접수완료', '담당자배정', '관공서진행중', '해결완료'
  assigned_expert_id uuid references public.experts(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. 문서 보관함 테이블 (Document_Vault)
create table public.document_vault (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id),
  doc_type text not null, -- '여권', '사업자등록증', '비자/TRC', '계약서'
  file_name text not null,
  file_url text not null, -- Supabase Storage 암호화 경로
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into public.experts (name, specialty, phone) values
  ('박민준', '공안 트러블슈팅', '010-2000-1001'),
  ('Nguyen Thi Lan', '노동법/비자', '010-2000-1002'),
  ('이서연', '법인설립/세무', '010-2000-1003');

alter table public.users enable row level security;
alter table public.experts enable row level security;
alter table public.emergency_tickets enable row level security;
alter table public.document_vault enable row level security;

create policy "users read own" on public.users for select using (auth.uid() = id);
create policy "users upsert own" on public.users for insert with check (auth.uid() = id);
create policy "users update own" on public.users for update using (auth.uid() = id);

create policy "experts readable" on public.experts for select using (true);
create policy "experts writable" on public.experts for all using (true) with check (true);

create policy "tickets readable" on public.emergency_tickets for select using (true);
create policy "tickets insertable" on public.emergency_tickets for insert with check (true);
create policy "tickets updatable" on public.emergency_tickets for update using (true);

create policy "vault readable" on public.document_vault for select using (true);
create policy "vault insertable" on public.document_vault for insert with check (true);
create policy "vault deletable" on public.document_vault for delete using (true);

insert into storage.buckets (id, name, public)
values ('ticket-media', 'ticket-media', true),
       ('document-vault', 'document-vault', false)
on conflict (id) do nothing;

create policy "ticket media upload" on storage.objects
  for insert with check (bucket_id = 'ticket-media');
create policy "ticket media read" on storage.objects
  for select using (bucket_id = 'ticket-media');
create policy "vault objects write" on storage.objects
  for insert with check (bucket_id = 'document-vault');
create policy "vault objects read" on storage.objects
  for select using (bucket_id = 'document-vault');
create policy "vault objects delete" on storage.objects
  for delete using (bucket_id = 'document-vault');

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Guest'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
