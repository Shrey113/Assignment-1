# Part 3: Shortest Job First (SJF) & Shortest Remaining Time First (SRTF)

def run_sjf(processes):
    """
    SJF (Non-Preemptive):
    Once a process starts executing, it runs to completion.
    At each step when CPU is free, choose the arrived process with the smallest burst time.
    """
    # Create shallow copies so we do not mutate caller's list
    procs = [p.copy() for p in processes]
    timeline = []
    current_time = 0

    while procs:
        # Filter all processes that have already arrived by current_time
        available = [p for p in procs if p["arrival"] <= current_time]

        if not available:
            # If no process has arrived yet, jump to the earliest arrival time
            current_time = min(p["arrival"] for p in procs)
            continue

        # Pick the process with the shortest burst time
        # If tie, pick the one that arrived earlier
        shortest = min(available, key=lambda p: (p["burst"], p["arrival"]))
        procs.remove(shortest)

        start = current_time
        end = start + shortest["burst"]
        timeline.append({
            "pid": shortest["pid"],
            "start": start,
            "end": end
        })
        current_time = end

    return timeline


def run_srtf(processes):
    """
    SRTF (Preemptive SJF):
    Simulates execution unit-by-unit (second by second).
    At every unit of time, pick the process with shortest remaining burst time.
    Merges consecutive time blocks of the same process into single timeline entries.
    """
    procs = [p.copy() for p in processes]
    # Ensure remaining is set
    for p in procs:
        if "remaining" not in p:
            p["remaining"] = p["burst"]

    timeline = []
    current_time = 0
    last_pid = None
    last_start = 0

    while any(p["remaining"] > 0 for p in procs):
        # Arrived processes that still need CPU time
        available = [p for p in procs if p["arrival"] <= current_time and p["remaining"] > 0]

        if not available:
            # CPU is idle this tick
            if last_pid is not None:
                timeline.append({"pid": last_pid, "start": last_start, "end": current_time})
                last_pid = None
            current_time += 1
            continue

        # Choose process with smallest remaining time (break ties by arrival time)
        running = min(available, key=lambda p: (p["remaining"], p["arrival"]))

        # If process changed, record the finished block of the previous process
        if running["pid"] != last_pid:
            if last_pid is not None:
                timeline.append({"pid": last_pid, "start": last_start, "end": current_time})
            last_pid = running["pid"]
            last_start = current_time

        # Run for 1 time unit
        running["remaining"] -= 1
        current_time += 1

    # Record the last active process block
    if last_pid is not None:
        timeline.append({"pid": last_pid, "start": last_start, "end": current_time})

    return timeline


if __name__ == "__main__":
    from process import make_process

    test_procs = [
        make_process("P1", 0, 7),
        make_process("P2", 2, 4),
        make_process("P3", 4, 1),
        make_process("P4", 5, 4),
    ]

    print("--- SJF (Non-Preemptive) ---")
    for b in run_sjf(test_procs):
        print(f"Process {b['pid']}: {b['start']} -> {b['end']}")

    print("\n--- SRTF (Preemptive SJF) ---")
    for b in run_srtf(test_procs):
        print(f"Process {b['pid']}: {b['start']} -> {b['end']}")
