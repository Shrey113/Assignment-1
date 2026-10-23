# Part 6: Performance Metrics Calculator
# Computes Waiting Time (WT), Turnaround Time (TAT), Response Time (RT),
# Context Switches, and CPU Utilization.

import pandas as pd

def calculate_metrics(processes, timeline):
    """
    Given original processes list and execution timeline:
    Returns (DataFrame of process stats, summary_dict of overall performance)
    """
    if not timeline:
        return pd.DataFrame(), {
            "avg_tat": 0, "avg_wt": 0, "avg_rt": 0,
            "cpu_utilization": 0, "context_switches": 0, "total_time": 0
        }

    rows = []
    total_cpu_busy = sum(block["end"] - block["start"] for block in timeline)
    total_time = max(block["end"] for block in timeline)

    # Count context switches: switches between distinct processes
    context_switches = 0
    for i in range(1, len(timeline)):
        if timeline[i]["pid"] != timeline[i - 1]["pid"]:
            context_switches += 1

    for proc in processes:
        pid = proc["pid"]
        blocks = [t for t in timeline if t["pid"] == pid]

        if not blocks:
            continue

        first_start = blocks[0]["start"]
        finish_time = blocks[-1]["end"]

        tat = finish_time - proc["arrival"]
        wt = tat - proc["burst"]
        rt = first_start - proc["arrival"]

        rows.append({
            "PID": pid,
            "Arrival": proc["arrival"],
            "Burst": proc["burst"],
            "Priority": proc.get("priority", "-"),
            "Finish": finish_time,
            "TAT": tat,
            "WT": wt,
            "RT": rt
        })

    df = pd.DataFrame(rows)

    # Sort table by Process ID (P1, P2, ...)
    try:
        df["sort_key"] = df["PID"].apply(lambda x: int(''.join(filter(str.isdigit, x))) if any(c.isdigit() for c in x) else 0)
        df = df.sort_values("sort_key").drop(columns=["sort_key"])
    except Exception:
        pass

    avg_tat = round(float(df["TAT"].mean()), 2)
    avg_wt = round(float(df["WT"].mean()), 2)
    avg_rt = round(float(df["RT"].mean()), 2)
    cpu_util = round((total_cpu_busy / total_time * 100), 2) if total_time > 0 else 0

    summary = {
        "avg_tat": avg_tat,
        "avg_wt": avg_wt,
        "avg_rt": avg_rt,
        "cpu_utilization": cpu_util,
        "context_switches": context_switches,
        "total_time": total_time
    }

    # Add summary AVG row to DataFrame for display
    avg_row = {
        "PID": "AVERAGE",
        "Arrival": "-",
        "Burst": "-",
        "Priority": "-",
        "Finish": "-",
        "TAT": avg_tat,
        "WT": avg_wt,
        "RT": avg_rt
    }
    df_with_avg = pd.concat([df, pd.DataFrame([avg_row])], ignore_index=True)

    return df_with_avg, summary


if __name__ == "__main__":
    from process import make_process
    from fcfs import run_fcfs

    procs = [
        make_process("P1", 0, 4),
        make_process("P2", 1, 3),
        make_process("P3", 2, 1),
    ]

    tl = run_fcfs(procs)
    df, summary = calculate_metrics(procs, tl)
    print("--- Metrics Table ---")
    print(df.to_string(index=False))
    print("\n--- Summary ---")
    for k, v in summary.items():
        print(f"{k}: {v}")
