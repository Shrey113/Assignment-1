import streamlit as st
import plotly.graph_objects as go

def render_metrics_table(df):
    """
    Renders styled process metrics dataframe with clean presentation.
    """
    if df.empty:
        st.warning("No metrics computed.")
        return

    st.markdown("##### Detailed Process Metrics Table")
    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True
    )

def render_summary_cards(summary):
    """
    Renders modern, lightweight KPI cards with clean typography.
    """
    c1, c2, c3, c4, c5 = st.columns(5)
    with c1:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">Avg Waiting Time</div>
            <div class="kpi-val" style="color: #2563EB;">{summary['avg_wt']} <span class="kpi-unit">ms</span></div>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">Avg Turnaround</div>
            <div class="kpi-val" style="color: #7C3AED;">{summary['avg_tat']} <span class="kpi-unit">ms</span></div>
        </div>
        """, unsafe_allow_html=True)
    with c3:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">Avg Response</div>
            <div class="kpi-val" style="color: #059669;">{summary['avg_rt']} <span class="kpi-unit">ms</span></div>
        </div>
        """, unsafe_allow_html=True)
    with c4:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">CPU Utilization</div>
            <div class="kpi-val" style="color: #0284C7;">{summary['cpu_utilization']}%</div>
        </div>
        """, unsafe_allow_html=True)
    with c5:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-label">Context Switches</div>
            <div class="kpi-val" style="color: #D97706;">{summary['context_switches']}</div>
        </div>
        """, unsafe_allow_html=True)

def render_comparison_charts(comparison_results):
    """
    Renders grouped bar charts contrasting Waiting, Turnaround, and Response Times side-by-side.
    """
    if not comparison_results:
        st.info("No comparative algorithms selected.")
        return

    algos = list(comparison_results.keys())
    wts = [comparison_results[a]["avg_wt"] for a in algos]
    tats = [comparison_results[a]["avg_tat"] for a in algos]
    rts = [comparison_results[a]["avg_rt"] for a in algos]

    fig = go.Figure()

    fig.add_trace(go.Bar(
        name="Avg Waiting Time (WT)",
        x=algos,
        y=wts,
        marker_color="#2563EB",  # Royal Blue
        text=[f"{v} ms" for v in wts],
        textposition="auto",
        textfont=dict(size=11, family="Segoe UI, sans-serif")
    ))
    fig.add_trace(go.Bar(
        name="Avg Turnaround Time (TAT)",
        x=algos,
        y=tats,
        marker_color="#7C3AED",  # Violet
        text=[f"{v} ms" for v in tats],
        textposition="auto",
        textfont=dict(size=11, family="Segoe UI, sans-serif")
    ))
    fig.add_trace(go.Bar(
        name="Avg Response Time (RT)",
        x=algos,
        y=rts,
        marker_color="#059669",  # Emerald
        text=[f"{v} ms" for v in rts],
        textposition="auto",
        textfont=dict(size=11, family="Segoe UI, sans-serif")
    ))

    fig.update_layout(
        title=dict(
            text="<b>Multi-Algorithm Performance Comparison (Lower Latency is Better)</b>",
            font=dict(size=15, color="#0F172A", family="Segoe UI, sans-serif")
        ),
        barmode="group",
        height=360,
        margin=dict(l=15, r=15, t=50, b=25),
        plot_bgcolor="#F8FAFC",   # Soft clean light canvas
        paper_bgcolor="#FFFFFF",  # Pure white background
        font=dict(color="#334155", family="Segoe UI, sans-serif"),
        xaxis=dict(
            title=dict(text="Scheduling Algorithms", font=dict(size=12, color="#475569")),
            gridcolor="#E2E8F0",
            tickfont=dict(color="#334155", size=11)
        ),
        yaxis=dict(
            title=dict(text="Time Units (ms)", font=dict(size=12, color="#475569")),
            gridcolor="#E2E8F0",
            tickfont=dict(color="#475569", size=11)
        ),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.03,
            xanchor="right",
            x=1,
            font=dict(color="#334155", size=11)
        )
    )

    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})
