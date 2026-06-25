-- Enable pgvector extension
create extension if not exists vector;

-- Table to store log chunks and their embeddings
create table log_chunks (
    id bigserial primary key,
    session_id text not null,
    chunk_index integer not null,
    start_line integer not null,
    end_line integer not null,
    content text not null,
    embedding vector(384)
);

-- Index for fast similarity search
create index on log_chunks using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);

-- Function for semantic similarity search
create or replace function match_chunks(
    query_embedding vector(384),
    session_id_filter text,
    match_count int default 5
)
returns table (
    id bigint,
    chunk_index integer,
    content text,
    similarity float
)
language plpgsql
as $$
begin
    return query
    select
        lc.id,
        lc.chunk_index,
        lc.content,
        1 - (lc.embedding <=> query_embedding) as similarity
    from log_chunks lc
    where lc.session_id = session_id_filter
    order by lc.embedding <=> query_embedding
    limit match_count;
end;
$$;
