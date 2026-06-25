from core.parser import parse_log
from core.spike_detector import detect_spikes


def test_no_spikes_in_clean_log():
    log = "\n".join(["2024-01-15 14:23:00 INFO normal operation"] * 30)
    chunks = parse_log(log)
    report = detect_spikes(chunks)
    assert not report.flagged
    assert report.total_counts.get("ERROR", 0) == 0


def test_detects_error_spike():
    log = "\n".join(["2024-01-15 14:23:00 ERROR something failed"] * 30)
    chunks = parse_log(log, chunk_size=20)
    report = detect_spikes(chunks)
    assert report.flagged
    assert report.total_counts["ERROR"] == 30


def test_warn_and_warning_counted_together():
    log = "\n".join(
        ["2024-01-15 14:23:00 WARN low disk"] * 3 +
        ["2024-01-15 14:23:00 WARNING memory low"] * 3
    )
    chunks = parse_log(log, chunk_size=20)
    report = detect_spikes(chunks)
    assert report.total_counts.get("WARN", 0) == 6


def test_critical_detected():
    log = "\n".join(["2024-01-15 14:23:00 CRITICAL system down"] * 10)
    chunks = parse_log(log, chunk_size=20)
    report = detect_spikes(chunks)
    assert report.total_counts.get("CRITICAL", 0) == 10


def test_spike_below_threshold_not_flagged():
    log = "\n".join(["2024-01-15 14:23:00 ERROR something failed"] * 3)
    chunks = parse_log(log, chunk_size=20)
    report = detect_spikes(chunks)
    assert not report.flagged  # 3 errors < threshold of 5
