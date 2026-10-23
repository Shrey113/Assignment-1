# Part 4: Priority Scheduling (Non-Preemptive & Preemptive)
# By standard OS convention: Lower numerical value = Higher Priority (e.g. Priority 1 > Priority 2)

def run_priority(processes):
    """
    Priority Scheduling (Non-Preemptive):
    Selects the available process with the highest priority (lowest number).
    Runs it until completion before picking the next one.
    """
    procs = [p.copy() for p in processes]
    timeline = []
    current_time = 0

    while procs:
        available = [p for p in procs if p["arrival"] <= current_time]

        if not available:
            current_time = min(p["arrival"] for p in procs)
            continue

        # Choose lowest priority number (highest priority), tie-break by arrival time
        chosen = min(available, key=lambda p: (p["priority"], p["arrival"]))
        procs.remove(chosen)

        start = current_time
        end = start + chosen["burst"]
        timeline.append({
            "pid": chosen["pid"],
            "start": start,
            "end": end
        })
        current_time = end

    return timeline


def run_priority_preemptive(processes):
    """
    Priority Scheduling (Preemptive):
    At each time unit, check if a newly arrived process has higher priority
    (lower number) than the currently running process. Preempt if so.
    """
    procs = [p.copy() for p in processes]
    for p in procs:
        if "remaining" not in p:
            p["remaining"] = p["burst"]

    timeline = []
    current_time = 0
    last_pid = None
    last_start = 0

    while any(p["remaining"] > 0 for p in procs):
        available = [p for p in procs if p["arrival"] <= current_time and p["remaining"] > 0]

        if not available:
            if last_pid is not None:
                timeline.append({"pid": last_pid, "start": last_start, "end": current_time})
                last_pid = None
            current_time += 1
            continue

        # Highest priority = lowest priority number
        running = min(available, key=lambda p: (p["priority"], p["arrival"]))

        if running["pid"] != last_pid:
            if last_pid is not None:
                timeline.append({"pid": last_pid, "start": last_start, "end": current_time})
            last_pid = running["pid"]
            last_start = current_time

        running["remaining"] -= 1
        current_time += 1

    if last_pid is not None:
        timeline.append({"pid": last_pid, "start": last_start, "end": current_time})

    return timeline


if __name__ == "__main__":
    from process import make_process

    test_procs = [
        make_process("P1", 0, 4, priority=2),
        make_process("P2", 1, 3, priority=1),
        make_process("P3", 2, 1, priority=4),
        make_process("P4", 3, 5, priority=3),
    ]

    print("--- Priority (Non-Preemptive) ---")
    for b in run_priority(test_procs):
        print(f"Process {b['pid']} (Priority {next(p['priority'] for p in test_procs if p['pid']==b['pid'])}): {b['start']} -> {b['end']}")

    print("\n--- Priority (Preemptive) ---")
    for b in run_priority_preemptive(test_procs):
        print(f"Process {b['pid']}: {b['start']} -> {b['end']}")
