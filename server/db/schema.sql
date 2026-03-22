-- CodePair Supabase schema

create table if not exists rooms (
  id bigserial primary key,
  code text unique not null,
  creator_id text,
  language text,
  difficulty text,
  type text,
  status text default 'lobby',
  created_at timestamptz default now()
);

create table if not exists sessions (
  id bigserial primary key,
  room_id bigint references rooms(id) on delete cascade,
  started_at timestamptz,
  ended_at timestamptz,
  final_code text,
  language text
);

create table if not exists participants (
  id bigserial primary key,
  session_id bigint references sessions(id) on delete cascade,
  user_name text not null,
  user_id text not null,
  color text,
  joined_at timestamptz default now()
);

create table if not exists messages (
  id bigserial primary key,
  session_id bigint references sessions(id) on delete cascade,
  sender text not null, -- 'ai' or user_id
  content text not null,
  timestamp timestamptz default now()
);

create table if not exists evaluations (
  id bigserial primary key,
  session_id bigint references sessions(id) on delete cascade,
  overall_score int,
  scores_json jsonb,
  summary text,
  created_at timestamptz default now()
);

create table if not exists code_snapshots (
  id bigserial primary key,
  session_id bigint references sessions(id) on delete cascade,
  code text,
  taken_at timestamptz default now()
);

