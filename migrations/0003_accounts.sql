alter table students add column if not exists username text;
alter table students add column if not exists password_hash text;
create unique index if not exists students_username_idx on students (username);
