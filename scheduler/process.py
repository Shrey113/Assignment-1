# Part 1: Process Data Model
# A simple beginner-friendly dictionary representation of a Process

def make_process(pid, arrival, burst, priority=0):
    """
    Creates a simple dictionary for a process.
    - pid: Process ID string (e.g. 'P1')
    - arrival: Arrival time (integer >= 0)
    - burst: CPU burst time needed (integer > 0)
    - priority: Priority value (integer, usually lower number = higher priority)
    - remaining: Remaining burst time (used for preemptive algorithms like SRTF / Round Robin)
    """
    return {
        "pid": str(pid),
        "arrival": int(arrival),
        "burst": int(burst),
        "priority": int(priority),
        "remaining": int(burst)
    }

if __name__ == "__main__":
    # Quick test to verify Part 1
    p1 = make_process("P1", 0, 5, 1)
    p2 = make_process("P2", 1, 3, 2)
    print("Part 1 verification:")
    print(p1)
    print(p2)
