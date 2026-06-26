import re
from collections import Counter
from dataclasses import dataclass, field

from core.parser import LogChunk

LEVEL_PATTERN = re.compile(r'\b(ERROR|WARN(?:ING)?|CRITICAL)\b', re.IGNORECASE)
SPIKE_THRESHOLD = 5
MAX_SAMPLE_LINES = 5


@dataclass
class SpikeReport:
    total_counts: dict[str, int]
    spikes: list[dict] = field(default_factory=list)
    flagged: bool = False
    sample_lines: dict = field(default_factory=dict)


def detect_spikes(chunks: list[LogChunk]) -> SpikeReport:
    total_counts: Counter = Counter()
    sample_lines: dict[str, list[str]] = {}
    spikes = []

    for chunk in chunks:
        chunk_counts: Counter = Counter()

        for line in chunk.lines:
            for match in LEVEL_PATTERN.findall(line):
                level = "WARN" if match.upper() == "WARNING" else match.upper()
                chunk_counts[level] += 1
                total_counts[level] += 1
                if level not in sample_lines:
                    sample_lines[level] = []
                if len(sample_lines[level]) < MAX_SAMPLE_LINES:
                    sample_lines[level].append(line.strip())

        for level, count in chunk_counts.items():
            if count >= SPIKE_THRESHOLD:
                spikes.append({
                    "level": level,
                    "chunk_index": chunk.index,
                    "count": count,
                    "start_line": chunk.start_line,
                    "end_line": chunk.end_line,
                })

    return SpikeReport(
        total_counts=dict(total_counts),
        spikes=spikes,
        flagged=len(spikes) > 0,
        sample_lines=sample_lines,
    )
