import streamlit as st
import pandas as pd
from scheduler.process import make_process
from scheduler.fcfs import run_fcfs
from scheduler.sjf import run_sjf, run_srtf
from scheduler.priority import run_priority, run_priority_preemptive
from scheduler.round_robin import run_round_robin
from scheduler.metrics import calculate_metrics
from scheduler.smart_suggest import analyze_and_recommend
from data.workloads import get_preset_workloads
from ui.gantt import render_gantt_chart
from ui.components import render_metrics_table, render_summary_cards, render_comparison_charts

# Page Configuration
st.set_page_config(
    page_title="Smart CPU Scheduler Simulator",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom High-End Styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 800;
        background: linear-gradient(90deg, #6366F1, #EC4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        color: #94A3B8;
        font-size: 1.05rem;
        margin-bottom: 1.5rem;
    }
    .smart-card {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 1.2rem;
        margin-bottom: 1.2rem;
    }
    .badge {
        display: inline-block;
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    .badge-primary { background: #6366F1; color: white; }
    .badge-success { background: #10B981; color: white; }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown('<div class="main-title">Smart CPU Scheduler Simulator</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Innovative Assignment 1 | Operating Systems | Interactive Algorithm Analysis & Gantt Visualizer</div>', unsafe_allow_html=True)

# ----------------- SIDEBAR: PROCESS CONFIGURATION -----------------
st.sidebar.header("Process Configuration")

input_mode = st.sidebar.radio(
    "Select Input Mode:",
    ["Use Preset Workload (Test Cases)", "Custom Manual Input", "Random Workload Generator"]
)

preset_workloads = get_preset_workloads()
processes = []

if input_mode == "Use Preset Workload (Test Cases)":
    selected_preset = st.sidebar.selectbox("Choose Test Case Workload:", list(preset_workloads.keys()))
    preset_data = preset_workloads[selected_preset]
    processes = [p.copy() for p in preset_data["processes"]]

elif input_mode == "Custom Manual Input":
    num_processes = st.sidebar.number_input("Number of Processes:", min_value=1, max_value=10, value=4, step=1)
    
    st.sidebar.markdown("**Process Details (Arrival, Burst, Priority):**")
    for i in range(int(num_processes)):
        col1, col2, col3 = st.sidebar.columns(3)
        with col1:
            arr = st.number_input(f"P{i+1} Arrival", min_value=0, max_value=50, value=i, key=f"arr_{i}")
        with col2:
            burst = st.number_input(f"P{i+1} Burst", min_value=1, max_value=50, value=(i+2) if i%2==0 else 2, key=f"burst_{i}")
        with col3:
            prio = st.number_input(f"P{i+1} Priority", min_value=1, max_value=20, value=i+1, key=f"prio_{i}")
        processes.append(make_process(f"P{i+1}", arr, burst, prio))

else: # Random Workload Generator
    import random
    num_procs = st.sidebar.slider("Number of Processes", 3, 8, 4)
    max_b = st.sidebar.slider("Max Burst Time", 3, 15, 6)
    if st.sidebar.button("Generate New Workload", use_container_width=True):
        st.session_state["rand_seed"] = random.randint(1, 10000)
    
    seed = st.session_state.get("rand_seed", 42)
    rng = random.Random(seed)
    for i in range(num_procs):
        processes.append(make_process(
            f"P{i+1}",
            arrival=rng.randint(0, 5),
            burst=rng.randint(1, max_b),
            priority=rng.randint(1, 5)
        ))

# Show Process Queue in Sidebar
with st.sidebar.expander("View Current Process Table", expanded=True):
    proc_df = pd.DataFrame([
        {"PID": p["pid"], "Arrival": p["arrival"], "Burst": p["burst"], "Priority": p["priority"]}
        for p in processes
    ])
    st.dataframe(proc_df, hide_index=True, use_container_width=True)

# ----------------- MAIN CONTENT TABS -----------------
tab1, tab2, tab3, tab4 = st.tabs([
    "Single Algorithm Analysis",
    "Comparative Benchmark",
    "Smart Recommendation (Bonus Feature)",
    "Assignment Report & Docs"
])

# Helper to run algorithm by name
def execute_algorithm(name, procs, rr_quantum=2):
    if name == "FCFS":
        return run_fcfs(procs)
    elif name == "SJF (Non-Preemptive)":
        return run_sjf(procs)
    elif name == "SRTF (Preemptive SJF)":
        return run_srtf(procs)
    elif name == "Priority (Non-Preemptive)":
        return run_priority(procs)
    elif name == "Priority (Preemptive)":
        return run_priority_preemptive(procs)
    elif name == "Round Robin (RR)":
        return run_round_robin(procs, quantum=rr_quantum)
    return []

# ----------------- TAB 1: SINGLE ALGORITHM -----------------
with tab1:
    col_sel, col_param = st.columns([3, 2])
    with col_sel:
        selected_algo = st.selectbox(
            "Select Scheduling Algorithm to Inspect:",
            [
                "FCFS",
                "SJF (Non-Preemptive)",
                "SRTF (Preemptive SJF)",
                "Priority (Non-Preemptive)",
                "Priority (Preemptive)",
                "Round Robin (RR)"
            ]
        )
    with col_param:
        quantum = 2
        if "Round Robin" in selected_algo:
            quantum = st.slider("Time Quantum (Time Slice):", min_value=1, max_value=10, value=2, step=1)
        else:
            st.write("") # Spacer

    # Run
    timeline = execute_algorithm(selected_algo, processes, rr_quantum=quantum)
    metrics_df, summary = calculate_metrics(processes, timeline)

    # 1. Summary Cards
    render_summary_cards(summary)
    st.markdown("---")

    # 2. Gantt Chart
    st.markdown("##### Execution Gantt Chart")
    render_gantt_chart(timeline, title=f"{selected_algo} Gantt Chart")

    # 3. Table
    render_metrics_table(metrics_df)

# ----------------- TAB 2: COMPARATIVE BENCHMARK -----------------
with tab2:
    st.markdown("#### Side-by-Side Algorithm Evaluation")
    st.caption("Runs all 6 scheduling algorithms on the exact same workload to determine the best performer.")

    rr_q = st.slider("Round Robin Quantum for Benchmark:", 1, 6, 2, key="bm_quantum")
    
    all_algos = [
        "FCFS",
        "SJF (Non-Preemptive)",
        "SRTF (Preemptive SJF)",
        "Priority (Non-Preemptive)",
        "Priority (Preemptive)",
        "Round Robin (RR)"
    ]

    benchmark_summaries = {}
    benchmark_table_rows = []

    for algo in all_algos:
        tl = execute_algorithm(algo, processes, rr_quantum=rr_q)
        _, summ = calculate_metrics(processes, tl)
        benchmark_summaries[algo] = summ
        benchmark_table_rows.append({
            "Algorithm": algo,
            "Avg Waiting Time (WT)": summ["avg_wt"],
            "Avg Turnaround Time (TAT)": summ["avg_tat"],
            "Avg Response Time (RT)": summ["avg_rt"],
            "CPU Utilization": f"{summ['cpu_utilization']}%",
            "Context Switches": summ["context_switches"]
        })

    # Comparative charts
    render_comparison_charts(benchmark_summaries)

    st.markdown("##### Benchmark Summary Table")
    bm_df = pd.DataFrame(benchmark_table_rows)
    st.dataframe(bm_df, hide_index=True, use_container_width=True)

# ----------------- TAB 3: SMART RECOMMENDATION -----------------
with tab3:
    st.markdown("#### Intelligent Scheduling Recommender (Additional Feature)")
    st.caption("Analyzes the variance of burst times, urgency tiers, and arrival distribution to recommend the best algorithm.")

    rec = analyze_and_recommend(processes)

    st.markdown(f"""
    <div class="smart-card">
        <h3>Recommendation: <span class="badge badge-primary">{rec['recommended_algo']}</span></h3>
        <p><b>Confidence Level:</b> <span class="badge badge-success">{rec['confidence']}</span></p>
        <p><b>Decision Rationale:</b> {rec['reason']}</p>
    </div>
    """, unsafe_allow_html=True)

    if rec["insights"]:
        st.markdown("**Workload Characterization Insights:**")
        for ins in rec["insights"]:
            st.info(f"• {ins}")

    # Run recommended algorithm immediately for user
    st.markdown(f"##### Auto-Execution of Recommended: **{rec['recommended_algo']}**")
    rec_algo_name = rec['recommended_algo']
    if "SRTF" in rec_algo_name or "SJF" in rec_algo_name:
        rec_algo_exec = "SRTF (Preemptive SJF)"
    elif "Priority" in rec_algo_name:
        rec_algo_exec = "Priority (Preemptive)"
    elif "Round Robin" in rec_algo_name:
        rec_algo_exec = "Round Robin (RR)"
    else:
        rec_algo_exec = "FCFS"

    rec_timeline = execute_algorithm(rec_algo_exec, processes, rr_quantum=2)
    rec_df, rec_summ = calculate_metrics(processes, rec_timeline)
    render_summary_cards(rec_summ)
    render_gantt_chart(rec_timeline, title=f"Gantt Chart for {rec_algo_exec}")

# ----------------- TAB 4: REPORT & DOCUMENTATION -----------------
with tab4:
    st.markdown("""
    ### Innovative Assignment 1 Documentation & Report Helper
    Use the data and screenshots from this dashboard to complete your 1–2 page submission report.

    #### 1. Algorithms Implemented
    - **FCFS (First-Come, First-Served):** Simplest FIFO scheme. Non-preemptive. Susceptible to the *Convoy Effect*.
    - **SJF (Shortest Job First):** Non-preemptive. Chooses the process with minimum CPU burst time.
    - **SRTF (Shortest Remaining Time First):** Preemptive version of SJF. Preempts if a newly arriving process has lower remaining time. Proven to yield minimum average waiting time.
    - **Priority Scheduling (Non-Preemptive & Preemptive):** Processes are dispatched based on priority rank (lower numerical value = higher priority).
    - **Round Robin (RR):** Preemptive time-sharing using a circular ready queue and fixed time quantum slice.

    #### 2. Performance Metrics Equations
    - **Turnaround Time (TAT)** = `Finish Time - Arrival Time`
    - **Waiting Time (WT)** = `Turnaround Time - Burst Time`
    - **Response Time (RT)** = `First CPU Allocation Time - Arrival Time`
    - **CPU Utilization (%)** = `(Total Busy Time / Total Schedule Length) * 100`

    #### 3. Additional Feature: Smart Workload-Based Algorithm Recommender
    - Implemented in `scheduler/smart_suggest.py`.
    - Automatically assesses statistical features (burst variance, priority range, arrival uniformity) to suggest the optimal algorithm.
    """)
