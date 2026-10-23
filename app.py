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

# Page Configuration (Clean, light layout)
st.set_page_config(
    page_title="Smart CPU Scheduler Simulator",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom High-End Styling: Clean, Modern, Professional Light/White Theme
st.markdown("""
<style>
    /* Global Font & Canvas Polish */
    html, body, [class*="css"] {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    .main-title {
        color: #0F172A;
        font-size: 2.1rem;
        font-weight: 800;
        letter-spacing: -0.5px;
        margin: 0;
        line-height: 1.2;
    }
    .sub-title {
        color: #64748B;
        font-size: 0.95rem;
        font-weight: 400;
        margin-top: 4px;
        margin-bottom: 1.2rem;
    }
    
    /* KPI Card Component */
    .kpi-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 14px 18px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        text-align: left;
        transition: all 0.2s ease;
    }
    .kpi-card:hover {
        border-color: #CBD5E1;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.06);
    }
    .kpi-label {
        color: #64748B;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
    }
    .kpi-val {
        font-size: 1.55rem;
        font-weight: 700;
        line-height: 1.2;
    }
    .kpi-unit {
        font-size: 0.8rem;
        font-weight: 500;
        color: #94A3B8;
    }
    
    /* Smart Recommender Card */
    .smart-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-left: 5px solid #2563EB;
        border-radius: 10px;
        padding: 18px 22px;
        margin-bottom: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .smart-title {
        color: #0F172A;
        font-size: 1.15rem;
        font-weight: 700;
        margin-bottom: 6px;
    }
    .badge-blue {
        background: #EFF6FF;
        color: #2563EB;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        display: inline-block;
        border: 1px solid #BFDBFE;
    }
    .badge-emerald {
        background: #ECFDF5;
        color: #059669;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        display: inline-block;
        border: 1px solid #A7F3D0;
    }

    /* Highly Visible Selectboxes & Dropdowns for Light Theme */
    div[data-testid="stSelectbox"] label,
    div[data-testid="stSelectbox"] label p {
        color: #0F172A !important;
        font-weight: 600 !important;
        font-size: 0.92rem !important;
        letter-spacing: -0.2px;
        margin-bottom: 4px !important;
    }
    
    div[data-testid="stSelectbox"] div[role="group"],
    div[data-baseweb="select"] > div {
        background-color: #FFFFFF !important;
        border: 1.5px solid #CBD5E1 !important;
        border-radius: 8px !important;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08) !important;
        transition: all 0.2s ease !important;
    }
    
    div[data-testid="stSelectbox"] div[role="group"]:hover,
    div[data-baseweb="select"] > div:hover {
        border-color: #3B82F6 !important;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.16) !important;
    }
    
    div[data-testid="stSelectbox"] div[role="group"]:focus-within,
    div[data-baseweb="select"] > div:focus-within {
        border-color: #2563EB !important;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.22) !important;
    }
    
    div[data-testid="stSelectbox"] input {
        color: #0F172A !important;
        font-weight: 600 !important;
        font-size: 0.92rem !important;
    }

    div[data-testid="stSelectbox"] svg {
        fill: #334155 !important;
        color: #334155 !important;
    }
    
    /* Dropdown Popover & Options Menu */
    div[data-testid="stSelectboxVirtualDropdown"],
    ul[role="listbox"],
    div[role="listbox"] {
        background-color: #FFFFFF !important;
        border: 1.5px solid #CBD5E1 !important;
        border-radius: 8px !important;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1) !important;
    }
    
    div[data-testid="stSelectboxVirtualDropdown"] [role="option"],
    ul[role="listbox"] li,
    div[role="listbox"] div[role="option"] {
        color: #1E293B !important;
        font-weight: 500 !important;
        border-radius: 6px !important;
        margin: 2px 4px !important;
        transition: background 0.15s ease !important;
    }
    
    div[data-testid="stSelectboxVirtualDropdown"] [role="option"]:hover,
    div[data-testid="stSelectboxVirtualDropdown"] [aria-selected="true"],
    ul[role="listbox"] li:hover,
    ul[role="listbox"] li[aria-selected="true"] {
        background-color: #EFF6FF !important;
        color: #1D4ED8 !important;
        font-weight: 600 !important;
    }

    /* Input Controls Visibility (Number Input, Sliders) */
    div[data-testid="stNumberInput"] div[role="group"] {
        background-color: #FFFFFF !important;
        border: 1.5px solid #CBD5E1 !important;
        border-radius: 8px !important;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08) !important;
    }
    div[data-testid="stNumberInput"] div[role="group"]:hover {
        border-color: #3B82F6 !important;
    }
    div[data-testid="stNumberInput"] div[role="group"]:focus-within {
        border-color: #2563EB !important;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.22) !important;
    }

    /* Sidebar Layout, Dimensions & Refinement */
    section[data-testid="stSidebar"] {
        width: 410px !important;
        min-width: 390px !important;
        background-color: #F8FAFC !important;
        border-right: 1px solid #E2E8F0 !important;
    }
    section[data-testid="stSidebar"] > div:first-child {
        padding-top: 1.5rem !important;
        padding-left: 1.15rem !important;
        padding-right: 1.15rem !important;
    }

    .sidebar-heading {
        color: #0F172A;
        font-size: 1.12rem;
        font-weight: 700;
        letter-spacing: -0.3px;
        margin-bottom: 2px;
    }
    .sidebar-sub {
        color: #64748B;
        font-size: 0.8rem;
        line-height: 1.35;
        margin-bottom: 12px;
    }
    .sidebar-section-label {
        color: #475569;
        font-size: 0.76rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 14px;
        margin-bottom: 6px;
    }

    div[data-testid="stRadio"] label p {
        color: #1E293B !important;
        font-size: 0.86rem !important;
        font-weight: 500 !important;
    }

</style>
""", unsafe_allow_html=True)

# Top Clean Header
st.markdown('<div class="main-title">Smart CPU Scheduler Simulator</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Interactive Algorithm Workbench • Real-Time Gantt Timeline Visualizer • Heuristic Workload Recommender</div>', unsafe_allow_html=True)

# ----------------- SIDEBAR: WORKLOAD CONFIGURATION -----------------
st.sidebar.markdown("""
<div class="sidebar-heading">Workload Setup</div>
<div class="sidebar-sub">Configure benchmark or custom arrival and burst parameters</div>
""", unsafe_allow_html=True)

input_mode = st.sidebar.radio(
    "Workload Ingestion Mode:",
    ["Preset Workloads (Test Cases)", "Custom Manual Input", "Random Workload Generator"],
    index=0
)

preset_workloads = get_preset_workloads()
processes = []

if input_mode == "Preset Workloads (Test Cases)":
    selected_preset = st.sidebar.selectbox("Choose Benchmark Workload:", list(preset_workloads.keys()))
    preset_data = preset_workloads[selected_preset]
    processes = [p.copy() for p in preset_data["processes"]]
    st.sidebar.caption(f"Loaded {len(processes)} processes from standard test suite.")

elif input_mode == "Custom Manual Input":
    st.sidebar.markdown("<div class='sidebar-section-label'>Process Parameters Table</div>", unsafe_allow_html=True)
    st.sidebar.caption("PIDs are auto-generated and can be added or edited directly in the table:")
    
    if "custom_procs_df" not in st.session_state or st.session_state["custom_procs_df"] is None or st.session_state["custom_procs_df"].empty:
        st.session_state["custom_procs_df"] = pd.DataFrame([
            {"PID": "P1", "Arrival": 0, "Burst": 2, "Priority": 1},
            {"PID": "P2", "Arrival": 1, "Burst": 2, "Priority": 2},
            {"PID": "P3", "Arrival": 2, "Burst": 4, "Priority": 3},
            {"PID": "P4", "Arrival": 3, "Burst": 2, "Priority": 4},
        ])
    
    col_btn1, col_btn2 = st.sidebar.columns(2)
    with col_btn1:
        if st.button("+ Add Process", use_container_width=True):
            next_num = len(st.session_state["custom_procs_df"]) + 1
            existing_pids = set(st.session_state["custom_procs_df"]["PID"].astype(str))
            while f"P{next_num}" in existing_pids:
                next_num += 1
            new_row = pd.DataFrame([{"PID": f"P{next_num}", "Arrival": 0, "Burst": 2, "Priority": 1}])
            st.session_state["custom_procs_df"] = pd.concat([st.session_state["custom_procs_df"], new_row], ignore_index=True)
            st.rerun()
    with col_btn2:
        if st.button("Reset Defaults", use_container_width=True):
            st.session_state["custom_procs_df"] = pd.DataFrame([
                {"PID": "P1", "Arrival": 0, "Burst": 2, "Priority": 1},
                {"PID": "P2", "Arrival": 1, "Burst": 2, "Priority": 2},
                {"PID": "P3", "Arrival": 2, "Burst": 4, "Priority": 3},
                {"PID": "P4", "Arrival": 3, "Burst": 2, "Priority": 4},
            ])
            st.rerun()

    curr_len = len(st.session_state["custom_procs_df"])
    auto_pid_default = f"P{curr_len + 1}"

    edited_df = st.sidebar.data_editor(
        st.session_state["custom_procs_df"],
        key="custom_process_editor",
        num_rows="dynamic",
        use_container_width=True,
        hide_index=True,
        column_config={
            "PID": st.column_config.TextColumn("PID", width="small", default=auto_pid_default, required=True),
            "Arrival": st.column_config.NumberColumn("Arrival", width="small", default=0, min_value=0, max_value=100, step=1, required=True),
            "Burst": st.column_config.NumberColumn("Burst", width="small", default=2, min_value=1, max_value=100, step=1, required=True),
            "Priority": st.column_config.NumberColumn("Priority", width="small", default=1, min_value=1, max_value=50, step=1, required=True),
        }
    )
    
    cleaned_rows = []
    for idx, row in edited_df.iterrows():
        pid = str(row.get("PID", "")).strip() if pd.notna(row.get("PID")) else ""
        if not pid or pid.lower() == "none":
            pid = f"P{idx + 1}"
            
        try:
            arr = int(row.get("Arrival", 0)) if pd.notna(row.get("Arrival")) else 0
        except (ValueError, TypeError):
            arr = 0
            
        try:
            burst = int(row.get("Burst", 1)) if pd.notna(row.get("Burst")) else 1
            burst = max(1, burst)
        except (ValueError, TypeError):
            burst = 1
            
        try:
            prio = int(row.get("Priority", 1)) if pd.notna(row.get("Priority")) else 1
        except (ValueError, TypeError):
            prio = 1
            
        cleaned_rows.append({"PID": pid, "Arrival": arr, "Burst": burst, "Priority": prio})
        processes.append(make_process(pid, arr, burst, prio))
        
    st.session_state["custom_procs_df"] = pd.DataFrame(cleaned_rows)

else: # Random Workload Generator
    import random
    num_procs = st.sidebar.slider("Number of Processes", 3, 8, 4)
    max_b = st.sidebar.slider("Maximum Burst Time", 3, 14, 6)
    if st.sidebar.button("Generate Stochastic Workload", use_container_width=True):
        st.session_state["rand_seed"] = random.randint(1, 10000)
    
    seed = st.session_state.get("rand_seed", 42)
    rng = random.Random(seed)
    for i in range(num_procs):
        processes.append(make_process(
            f"P{i+1}",
            arrival=rng.randint(0, 4),
            burst=rng.randint(1, max_b),
            priority=rng.randint(1, 5)
        ))

if not processes:
    processes = [make_process("P1", 0, 2, 1)]

# Current Process Table in Sidebar (shown for Preset and Random modes)
if input_mode != "Custom Manual Input":
    with st.sidebar.expander("Active Process Queue", expanded=True):
        proc_df = pd.DataFrame([
            {"PID": p["pid"], "Arrival (ms)": p["arrival"], "Burst (ms)": p["burst"], "Priority Rank": p["priority"]}
            for p in processes
        ])
        st.dataframe(proc_df, hide_index=True, use_container_width=True)

# ----------------- MAIN CONTENT TABS -----------------
tab1, tab2, tab3 = st.tabs([
    "Single Algorithm Analysis",
    "Comparative Benchmark",
    "Smart Recommendation"
])

def execute_algorithm(name, procs, rr_quantum=2):
    """Executes scheduling algorithm by name and returns timeline list."""
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
            quantum = st.slider("Round Robin Time Quantum (Q):", min_value=1, max_value=8, value=2, step=1)
        else:
            st.write("")

    # Execute and compute
    timeline = execute_algorithm(selected_algo, processes, rr_quantum=quantum)
    metrics_df, summary = calculate_metrics(processes, timeline)

    # 1. Metric Summary Cards
    render_summary_cards(summary)
    st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)

    # 2. Gantt Chart
    render_gantt_chart(timeline, title=f"{selected_algo} — Execution Gantt Chart Timeline")

    # 3. Process Table
    render_metrics_table(metrics_df)

# ----------------- TAB 2: COMPARATIVE BENCHMARK -----------------
with tab2:
    st.markdown("##### Side-by-Side Performance Benchmark")
    st.caption("Executes all six scheduling algorithms simultaneously across the active workload to contrast operational trade-offs.")

    col_q, _ = st.columns([2, 3])
    with col_q:
        rr_q = st.slider("Round Robin Time Quantum for Benchmark:", 1, 6, 2, key="bm_quantum")
    
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
            "Avg WT (ms)": summ["avg_wt"],
            "Avg TAT (ms)": summ["avg_tat"],
            "Avg RT (ms)": summ["avg_rt"],
            "CPU Utilization": f"{summ['cpu_utilization']}%",
            "Context Switches": summ["context_switches"]
        })

    # Render Grouped Bar Chart
    render_comparison_charts(benchmark_summaries)

    st.markdown("<div style='height: 8px;'></div>", unsafe_allow_html=True)
    st.markdown("##### Benchmark Metrics Master Table")
    bm_df = pd.DataFrame(benchmark_table_rows)
    st.dataframe(bm_df, hide_index=True, use_container_width=True)

# ----------------- TAB 3: SMART RECOMMENDATION -----------------
with tab3:
    st.markdown("##### Autonomous Workload-Based Recommender")
    st.caption("Evaluates burst variance, priority spread, and arrival uniformity to suggest the optimal algorithm.")

    rec = analyze_and_recommend(processes)

    st.markdown(f"""
    <div class="smart-card">
        <div class="smart-title">Recommended Strategy: <span class="badge-blue">{rec['recommended_algo']}</span></div>
        <div style="margin-top: 4px; margin-bottom: 8px;">
            <b>Confidence Score:</b> <span class="badge-emerald">{rec['confidence']}</span>
        </div>
        <div style="color: #334155; font-size: 0.92rem; line-height: 1.45;">
            <b>Decision Rationale:</b> {rec['reason']}
        </div>
    </div>
    """, unsafe_allow_html=True)

    if rec["insights"]:
        st.markdown("**Workload Statistical Characterization:**")
        for ins in rec["insights"]:
            st.info(f"• {ins}")

    # Auto-execute recommendation
    st.markdown(f"##### Automated Execution of Recommended: **{rec['recommended_algo']}**")
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
    render_gantt_chart(rec_timeline, title=f"Gantt Timeline for {rec_algo_exec}")

