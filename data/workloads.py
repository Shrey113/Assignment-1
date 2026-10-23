# Part 9: Presets for the 3 Required Test Workloads
# 1. Short Jobs: Burst times are all small (1-4)
# 2. Mixed Jobs: Mix of very short and long CPU-heavy processes
# 3. High-Priority Spread: Processes with distinct critical priority assignments

from scheduler.process import make_process

def get_preset_workloads():
    """
    Returns a dictionary of the 3 predefined test cases required by the assignment.
    """
    return {
        "Test Case 1: Short Jobs Workload": {
            "description": "Short burst time processes (1 - 3 ms). Demonstrates where SJF/SRTF shines with low average wait times.",
            "processes": [
                make_process("P1", arrival=0, burst=2, priority=3),
                make_process("P2", arrival=1, burst=1, priority=1),
                make_process("P3", arrival=2, burst=3, priority=2),
                make_process("P4", arrival=3, burst=1, priority=4),
            ]
        },
        "Test Case 2: Mixed Jobs Workload": {
            "description": "Mix of short, medium, and large CPU burst times. Demonstrates convoy effect under FCFS and fairness with Round Robin.",
            "processes": [
                make_process("P1", arrival=0, burst=8, priority=2),
                make_process("P2", arrival=1, burst=2, priority=1),
                make_process("P3", arrival=2, burst=5, priority=3),
                make_process("P4", arrival=3, burst=1, priority=1),
                make_process("P5", arrival=4, burst=6, priority=4),
            ]
        },
        "Test Case 3: High-Priority Jobs Workload": {
            "description": "Processes arriving simultaneously and sequentially with varied priorities. Shows priority scheduling dynamics.",
            "processes": [
                make_process("P1", arrival=0, burst=4, priority=3),
                make_process("P2", arrival=0, burst=3, priority=1),
                make_process("P3", arrival=1, burst=6, priority=2),
                make_process("P4", arrival=2, burst=2, priority=1),
            ]
        }
    }

if __name__ == "__main__":
    workloads = get_preset_workloads()
    for name, data in workloads.items():
        print(f"\n{name} ({len(data['processes'])} processes):")
        print(f"  Description: {data['description']}")
        for p in data['processes']:
            print(f"    {p['pid']} -> Arrival: {p['arrival']}, Burst: {p['burst']}, Priority: {p['priority']}")
