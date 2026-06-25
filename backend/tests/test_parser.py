from core.parser import parse_log

SAMPLE_LOG = "\n".join([
    f"2024-01-15 14:23:{i:02d} INFO line {i}" for i in range(50)
])


def test_chunks_are_created():
    chunks = parse_log(SAMPLE_LOG)
    assert len(chunks) > 0


def test_chunk_count():
    chunks = parse_log(SAMPLE_LOG, chunk_size=20)
    assert len(chunks) == 3  # 50 lines → 20, 20, 10


def test_chunk_text_contains_lines():
    chunks = parse_log(SAMPLE_LOG, chunk_size=20)
    assert "INFO" in chunks[0].text


def test_empty_lines_are_skipped():
    log = "line1\n\n\nline2\n"
    chunks = parse_log(log, chunk_size=10)
    assert len(chunks) == 1
    assert len(chunks[0].lines) == 2


def test_start_and_end_line_numbers():
    chunks = parse_log(SAMPLE_LOG, chunk_size=20)
    assert chunks[0].start_line == 1
    assert chunks[0].end_line == 20
    assert chunks[1].start_line == 21
