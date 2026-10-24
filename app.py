import streamlit as st
import pandas as pd
import base64
from pathlib import Path
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

# Custom High-End Styling: Loaded from external CSS file
def load_css(file_name="style.css"):
    css_file = Path(__file__).parent / file_name
    if css_file.exists():
        with open(css_file, "r", encoding="utf-8") as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

load_css("style.css")

# Browser localStorage Tour State Manager: checks & persists tour dismissal on client browser
st.html("""
<script>
(function() {
    function checkAndApplyTourVisibility() {
        try {
            const storage = window.localStorage;
            if (!storage) return;

            const ingestionDone = storage.getItem('tour_ingestion_dismissed') === 'true';
            const algoDone = storage.getItem('tour_algo_dismissed') === 'true';

            let style = document.getElementById('tour-localstorage-sync-styles');
            if (!style) {
                style = document.createElement('style');
                style.id = 'tour-localstorage-sync-styles';
                (document.head || document.body).appendChild(style);
            }

            let css = '';
            if (ingestionDone) {
                css += `
                .st-key-tour_ingestion_container,
                div[data-testid="stLayoutWrapper"]:has(.st-key-tour_ingestion_container),
                div[data-testid="stElementContainer"]:has(.st-key-tour_ingestion_container),
                div[data-testid="stLayoutWrapper"]:has(.st-key-dismiss_tour_ingestion),
                div[data-testid="stElementContainer"]:has(.st-key-dismiss_tour_ingestion),
                .st-key-dismiss_tour_ingestion {
                    display: none !important;
                }
                `;
            }
            if (algoDone) {
                css += `
                .st-key-tour_algo_container,
                div[data-testid="stLayoutWrapper"]:has(.st-key-tour_algo_container),
                div[data-testid="stElementContainer"]:has(.st-key-tour_algo_container),
                div[data-testid="stLayoutWrapper"]:has(.st-key-dismiss_tour_algo),
                div[data-testid="stElementContainer"]:has(.st-key-dismiss_tour_algo),
                .st-key-dismiss_tour_algo {
                    display: none !important;
                }
                `;
            }
            if (ingestionDone && algoDone) {
                css += `
                .st-key-reopen_tour_container,
                div[data-testid="stLayoutWrapper"]:has(.st-key-reopen_tour_container),
                div[data-testid="stElementContainer"]:has(.st-key-reopen_tour_container),
                .st-key-reopen_tour_guides {
                    display: block !important;
                }
                `;
            } else {
                css += `
                .st-key-reopen_tour_container,
                div[data-testid="stLayoutWrapper"]:has(.st-key-reopen_tour_container),
                div[data-testid="stElementContainer"]:has(.st-key-reopen_tour_container),
                .st-key-reopen_tour_guides {
                    display: none !important;
                }
                `;
            }
            style.textContent = css;
        } catch(e) {
            console.error('Tour localStorage sync error:', e);
        }
    }

    checkAndApplyTourVisibility();

    if (!window._tourStorageSyncInitialized) {
        window._tourStorageSyncInitialized = true;

        document.addEventListener('click', function(e) {
            try {
                const target = e.target;
                if (!target) return;
                const storage = window.localStorage;
                if (!storage) return;

                if (target.closest('.st-key-dismiss_tour_ingestion')) {
                    storage.setItem('tour_ingestion_dismissed', 'true');
                    checkAndApplyTourVisibility();
                }

                if (target.closest('.st-key-dismiss_tour_algo')) {
                    storage.setItem('tour_algo_dismissed', 'true');
                    checkAndApplyTourVisibility();
                }

                if (target.closest('.st-key-reopen_tour_guides')) {
                    storage.removeItem('tour_ingestion_dismissed');
                    storage.removeItem('tour_algo_dismissed');
                    checkAndApplyTourVisibility();
                }
            } catch(e) {
                console.error(e);
            }
        }, true);

        const observer = new MutationObserver(function() {
            checkAndApplyTourVisibility();
        });
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
})();
</script>
""", unsafe_allow_javascript=True)

# Top Clean Header
st.markdown('<div class="main-title">Smart CPU Scheduler Simulator</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Interactive Algorithm Workbench • Real-Time Gantt Timeline Visualizer • Heuristic Workload Recommender</div>', unsafe_allow_html=True)

# ----------------- SIDEBAR: WORKLOAD CONFIGURATION -----------------
st.sidebar.markdown("""
<div class="sidebar-heading">Workload Setup</div>
<div class="sidebar-sub">Configure benchmark or custom arrival and burst parameters</div>
""", unsafe_allow_html=True)

st.sidebar.markdown("<div class='sidebar-divider'></div>", unsafe_allow_html=True)

input_mode = st.sidebar.radio(
    "Workload Ingestion Mode:",
    ["Preset Workloads (Test Cases)", "Custom Manual Input", "Random Workload Generator"],
    index=0
)

with st.sidebar.container(key="tour_ingestion_container"):
    st.markdown("""
    <div class="tour-card-header">
        <span class="tour-card-title">Workload Ingestion Mode</span>
        <span class="tour-card-badge">Guide</span>
    </div>
    <div class="tour-card-desc">
        Configure how processes enter the scheduler: preset benchmarks, interactive table input, or random generator.
    </div>
    """, unsafe_allow_html=True)
    if st.button("Yes, I understand", key="dismiss_tour_ingestion", type="primary", use_container_width=True):
        pass

st.sidebar.markdown("<div class='sidebar-divider'></div>", unsafe_allow_html=True)

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
    st.sidebar.markdown("<div class='sidebar-divider'></div>", unsafe_allow_html=True)
    with st.sidebar.expander("Active Process Queue", expanded=True):
        proc_df = pd.DataFrame([
            {"PID": p["pid"], "Arrival (ms)": p["arrival"], "Burst (ms)": p["burst"], "Priority Rank": p["priority"]}
            for p in processes
        ])
        st.dataframe(proc_df, hide_index=True, use_container_width=True)

with st.sidebar.container(key="reopen_tour_container"):
    st.markdown("<div style='margin-top: 14px;'></div>", unsafe_allow_html=True)
    if st.button("Show Feature Guides", key="reopen_tour_guides", use_container_width=True):
        pass

def get_github_badge_html():
    icon_path = Path(__file__).parent / "assets" / "icon" / "github-logo.png"
    b64_img = ""
    if icon_path.exists():
        with open(icon_path, "rb") as f:
            b64_img = base64.b64encode(f.read()).decode("utf-8")
    return f"""
    <div class="sidebar-footer-container">
        <div class="built-by-label">Build by</div>
        <a href="https://github.com/shrey113" target="_blank" rel="noopener noreferrer" class="github-log-btn">
            <div class="github-icon-circle">
                <img src="data:image/png;base64,{b64_img}" alt="GitHub" />
            </div>
            <span class="github-btn-text">shrey113</span>
        </a>
    </div>
    """

st.sidebar.markdown(get_github_badge_html(), unsafe_allow_html=True)

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
    col_sel, col_param = st.columns([1, 1])
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
            with st.container(key="tour_algo_container"):
                st.markdown("""
                <div class="tour-card-header">
                    <span class="tour-card-title">Select Scheduling Algorithm to Inspect</span>
                    <span class="tour-card-badge">Guide</span>
                </div>
                <div class="tour-card-desc">
                    Choose an algorithm (FCFS, SJF, SRTF, Priority, or Round Robin) to inspect the live Gantt execution timeline and performance metrics.
                </div>
                """, unsafe_allow_html=True)
                if st.button("Yes, I understand", key="dismiss_tour_algo", type="primary", use_container_width=True):
                    pass

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

