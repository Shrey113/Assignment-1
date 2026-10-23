# Part 2: First-Come, First-Served (FCFS) Scheduling Algorithm
# Non-preemptive: Run processes strictly in order of their arrival time.

def run_fcfs(processes):
    """
    Simulates FCFS scheduling.
    Input: list of process dictionaries (created using make_process)
    Output: list of timeline blocks: [{'pid': ..., 'start': ..., 'end': ...}, ...]
    """
    # Sort processes by arrival time (earliest arrival first)
    sorted_procs = sorted(processes, key=lambda p: p["arrival"])
    
    timeline = []
    current_time = 0

    for proc in sorted_procs:
        # If CPU is idle before this process arrives, jump forward to arrival time
        if current_time < proc["arrival"]:
            current_time = proc["arrival"]
        
        start = current_time
        end = start + proc["burst"]
        
        timeline.append({
            "pid": proc["pid"],
            "start": start,
            "end": end
        })
        
        # Advance current time to the finish time of this process
        current_time = end

    return timeline

if __name__ == "__main__":
    from process import make_process

    # Quick test case
    test_procs = [
        make_process("P1", 0, 4),
        make_process("P2", 1, 3),
        make_process("P3", 2, 1),
    ]

    result = run_fcfs(test_procs)
    print("Part 2 FCFS verification timeline:")
    for block in result:
        print(f"Process {block['pid']}: Start = {block['start']}, End = {block['end']}")
