from dataclasses import dataclass


@dataclass
class LogChunk:
    index: int
    lines: list[str]
    text: str
    start_line: int
    end_line: int


def parse_log(content: str, chunk_size: int = 20) -> list[LogChunk]:
    lines = [line for line in content.splitlines() if line.strip()]
    chunks = []

    for i in range(0, len(lines), chunk_size):
        chunk_lines = lines[i : i + chunk_size]
        chunks.append(
            LogChunk(
                index=len(chunks),
                lines=chunk_lines,
                text="\n".join(chunk_lines),
                start_line=i + 1,
                end_line=min(i + chunk_size, len(lines)),
            )
        )

    return chunks
