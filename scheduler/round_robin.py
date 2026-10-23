# Part 5: Round Robin (RR) Scheduling Algorithm
# Preemptive scheduling based on a fixed time quantum.
# A FIFO queue is maintained for arrived processes.

from collections import deque

def run_round_robin(processes, quantum=2):
    """
    Simulates Round Robin scheduling with a given time quantum.
    - Each process runs for up to `quantum` units.
    - If it doesn't finish, it gets put back at the tail of the ready queue.
    - Any newly arrived processes during execution are added to the ready queue before re-adding the current process.
    """
    procs = [p.copy() for p in processes]
    for p in procs:
        p["remaining"] = p["burst"]

    # Sort strictly by arrival time initially
    procs.sort(key=lambda p: p["arrival"])

    queue = deque()
    timeline = []
    current_time = 0
    proc_index = 0
    n = len(procs)

    # Function to push any newly arrived processes to ready queue
    def check_arrivals():
        nonlocal proc_index
        while proc_index < n and procs[proc_index]["arrival"] <= current_time:
            queue.append(procs[proc_index])
            proc_index += 1

    check_arrivals()

    while queue or proc_index < n:
        if not queue:
            # CPU is idle, advance time to next process arrival
            current_time = procs[proc_index]["arrival"]
            check_arrivals()
            continue

        curr = queue.popleft()

        # Run for either the full quantum or until process completes
        run_time = min(quantum, curr["remaining"])
        start = current_time
        end = start + run_time

        timeline.append({
            "pid": curr["pid"],
            "start": start,
            "end": end
        })

        current_time = end
        curr["remaining"] -= run_time

        # Check for any new processes that arrived during this time slice
        check_arrivals()

        # If current process still has work, requeue it at the end
        if curr["remaining"] > 0:
            queue.append(curr)

    return timeline


if __name__ == "__main__":
    from process import make_process

    test_procs = [
        make_process("P1", 0, 5),
        make_process("P2", 1, 4),
        make_process("P3", 2, 2),
        make_process("P4", 4, 1),
    ]

    print("--- Round Robin (Quantum = 2) ---")
    timeline = run_round_robin(test_procs, quantum=2)
    for b in timeline:
        print(f"Process {b['pid']}: {b['start']} -> {b['end']}")
