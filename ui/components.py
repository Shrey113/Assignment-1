# Part 8: Performance Tables and Comparison Graphs
import streamlit as st
import plotly.graph_objects as go

def render_metrics_table(df):
    """
    Renders styled process metrics dataframe with highlighted averages and KPI cards.
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
    Displays quick metric cards for Avg WT, Avg TAT, Avg RT, and CPU Utilization.
    """
    col1, col2, col3, col4, col5 = st.columns(5)
    with col1:
        st.metric("Avg Waiting Time", f"{summary['avg_wt']} ms")
    with col2:
        st.metric("Avg Turnaround Time", f"{summary['avg_tat']} ms")
    with col3:
        st.metric("Avg Response Time", f"{summary['avg_rt']} ms")
    with col4:
        st.metric("CPU Utilization", f"{summary['cpu_utilization']}%")
    with col5:
        st.metric("Context Switches", f"{summary['context_switches']}")

def render_comparison_charts(comparison_results):
    """
    Given a dictionary of {algo_name: summary_dict},
    renders comparative bar charts side-by-side.
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
        name="Avg Waiting Time",
        x=algos,
        y=wts,
        marker_color="#6366F1",
        text=wts,
        textposition="auto"
    ))
    fig.add_trace(go.Bar(
        name="Avg Turnaround Time",
        x=algos,
        y=tats,
        marker_color="#EC4899",
        text=tats,
        textposition="auto"
    ))
    fig.add_trace(go.Bar(
        name="Avg Response Time",
        x=algos,
        y=rts,
        marker_color="#10B981",
        text=rts,
        textposition="auto"
    ))

    fig.update_layout(
        title="<b>Algorithm Performance Comparison (Lower is Better)</b>",
        barmode="group",
        height=380,
        plot_bgcolor="rgba(15, 23, 42, 0.6)",
        paper_bgcolor="rgba(0, 0, 0, 0)",
        font=dict(color="#94A3B8"),
        xaxis=dict(title="Algorithms", gridcolor="#334155"),
        yaxis=dict(title="Time Units", gridcolor="#334155"),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            font=dict(color="#E2E8F0")
        )
    )

    st.plotly_chart(fig, use_container_width=True)
