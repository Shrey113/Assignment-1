# Part 10: Smart Workload Recommendation & Dynamic Scheduler (Bonus Feature)
# Evaluates workload characteristics (Burst variance, Priority variance, Arrival distribution)
# and intelligently recommends the optimal CPU scheduling algorithm.

def analyze_and_recommend(processes):
    """
    Evaluates processes and returns:
    {
        "recommended_algo": "...",
        "confidence": "High / Moderate",
        "reason": "...",
        "insights": [...]
    }
    """
    if not processes:
        return {
            "recommended_algo": "FCFS",
            "confidence": "Low",
            "reason": "No processes provided.",
            "insights": []
        }

    bursts = [p["burst"] for p in processes]
    priorities = [p["priority"] for p in processes]
    arrivals = [p["arrival"] for p in processes]

    max_burst = max(bursts)
    min_burst = min(bursts)
    avg_burst = sum(bursts) / len(bursts)
    burst_variance = sum((b - avg_burst) ** 2 for b in bursts) / len(bursts)

    unique_priorities = len(set(priorities))
    priority_range = max(priorities) - min(priorities)

    insights = []

    # Rule 1: Priority Spread (Only consider if priority was deliberately specified by user or distinct)
    # Check if priority is the primary differentiator
    if priority_range >= 2 and unique_priorities >= 3 and min(priorities) < 3 and max_burst > 4:
        insights.append(f"Clear priority differentiation detected (range: {min(priorities)} to {max(priorities)}).")
        return {
            "recommended_algo": "Priority Scheduling (Preemptive)",
            "confidence": "High",
            "reason": "The workload has high-priority critical tasks mixed with long low-priority background jobs. Preemptive Priority scheduling guarantees immediate CPU access for urgent tasks.",
            "insights": insights
        }

    # Rule 2: Short Jobs Dominance
    # If all or most jobs are short (burst <= 4)
    if max_burst <= 4:
        insights.append(f"All jobs are lightweight with burst times <= {max_burst} ms.")
        return {
            "recommended_algo": "SJF / SRTF",
            "confidence": "High",
            "reason": "Shortest Remaining Time First (SRTF) mathematically minimizes average waiting time for short, rapid-turnaround processes.",
            "insights": insights
        }

    # Rule 3: High burst variance (Mixed long & short jobs)
    if burst_variance > 4:
        insights.append(f"High burst time variance detected (range: {min_burst} ms to {max_burst} ms, variance: {round(burst_variance, 2)}).")
        return {
            "recommended_algo": "Round Robin (RR)",
            "confidence": "High",
            "reason": "High burst variation causes the Convoy Effect under FCFS. Round Robin guarantees starvation prevention and fair time-sharing for all tasks.",
            "insights": insights
        }

    # Rule 4: Uniform arrival times
    if len(set(arrivals)) == 1:
        insights.append(f"All processes arrived at the exact same instant (t = {arrivals[0]}).")
        return {
            "recommended_algo": "FCFS",
            "confidence": "Moderate",
            "reason": "Batch arrival with uniform execution demands renders simple FCFS optimal with zero preemption overhead.",
            "insights": insights
        }

    # Default fallback
    return {
        "recommended_algo": "Round Robin (RR)",
        "confidence": "Moderate",
        "reason": "Standard multi-task workload. Round Robin offers balanced turnaround times with steady interactive responsiveness.",
        "insights": insights
    }


if __name__ == "__main__":
    from data.workloads import get_preset_workloads

    workloads = get_preset_workloads()
    for name, data in workloads.items():
        rec = analyze_and_recommend(data["processes"])
        print(f"\n{name}:")
        print(f"  Recommended: {rec['recommended_algo']} ({rec['confidence']} confidence)")
        print(f"  Reason: {rec['reason']}")
