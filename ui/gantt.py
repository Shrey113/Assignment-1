# Part 7: Interactive Gantt Chart using Plotly
import plotly.graph_objects as go
import streamlit as st

# Premium cohesive color palette
PALETTE = [
    "#6366F1", "#EC4899", "#10B981", "#F59E0B",
    "#3B82F6", "#8B5CF6", "#14B8A6", "#EF4444",
    "#06B6D4", "#84CC16"
]

def render_gantt_chart(timeline, title="CPU Execution Gantt Chart"):
    """
    Renders a clean, high-contrast, modern Gantt chart for the given timeline blocks.
    timeline = [{'pid': 'P1', 'start': 0, 'end': 4}, ...]
    """
    if not timeline:
        st.info("No timeline data to display.")
        return

    fig = go.Figure()

    # Create mapping of unique process IDs to color
    pids = list(dict.fromkeys(t["pid"] for t in timeline))
    color_map = {pid: PALETTE[i % len(PALETTE)] for i, pid in enumerate(pids)}
    seen_legend = set()

    max_time = max(block["end"] for block in timeline)

    for block in timeline:
        pid = block["pid"]
        duration = block["end"] - block["start"]
        show_in_legend = pid not in seen_legend
        if show_in_legend:
            seen_legend.add(pid)

        fig.add_trace(go.Bar(
            name=pid,
            x=[duration],
            y=["CPU Pipeline"],
            base=[block["start"]],
            orientation="h",
            marker=dict(
                color=color_map[pid],
                line=dict(color="#1E293B", width=1.5)
            ),
            text=f"<b>{pid}</b> ({block['start']} → {block['end']})",
            textposition="inside",
            insidetextanchor="middle",
            textfont=dict(color="white", size=13, family="sans-serif"),
            hovertemplate=(
                f"<b>Process {pid}</b><br>"
                f"Start Time: {block['start']}<br>"
                f"End Time: {block['end']}<br>"
                f"Duration: {duration}<extra></extra>"
            ),
            showlegend=show_in_legend
        ))

    # Add vertical timeline ticks for every integer time unit
    fig.update_layout(
        title=dict(text=f"<b>{title}</b>", font=dict(size=16, color="#F8FAFC")),
        barmode="stack",
        height=220,
        margin=dict(l=20, r=20, t=50, b=30),
        plot_bgcolor="rgba(15, 23, 42, 0.6)",
        paper_bgcolor="rgba(0, 0, 0, 0)",
        font=dict(color="#94A3B8"),
        xaxis=dict(
            title="Time Units",
            dtick=1 if max_time <= 30 else 2,
            range=[0, max_time + 0.5],
            gridcolor="#334155",
            zerolinecolor="#475569"
        ),
        yaxis=dict(
            showticklabels=False,
            showgrid=False
        ),
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
