create table if not exists students (
  id text primary key,
  name text not null,
  class_name text not null,
  student_no text not null,
  created_at timestamptz not null default now(),
  unique (class_name, student_no)
);

create table if not exists asks (
  id text primary key,
  student_id text not null references students (id),
  character_id text not null,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

create index if not exists asks_student_time_idx on asks (student_id, created_at desc);
