import plotly.graph_objects as go
import streamlit as st

# Refined, high-contrast professional color palette
PALETTE = [
    "#4F46E5",  # Indigo
    "#0284C7",  # Sky Blue
    "#059669",  # Emerald
    "#D97706",  # Amber
    "#7C3AED",  # Violet
    "#DB2777",  # Pink
    "#2563EB",  # Blue
    "#EA580C",  # Orange
    "#0D9488",  # Teal
    "#E11D48"   # Rose
]

def render_gantt_chart(timeline, title="CPU Execution Gantt Chart"):
    """
    Renders a crisp, modern, light-themed Gantt chart for the given timeline blocks.
    timeline = [{'pid': 'P1', 'start': 0, 'end': 4}, ...]
    """
    if not timeline:
        st.info("No timeline data to display.")
        return

    fig = go.Figure()

    # Map unique process IDs to palette
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
                line=dict(color="#FFFFFF", width=2.0)  # Crisp white block separators
            ),
            text=f"<b>{pid}</b> ({block['start']} → {block['end']})",
            textposition="inside",
            insidetextanchor="middle",
            textfont=dict(color="#FFFFFF", size=12, family="Segoe UI, sans-serif"),
            hovertemplate=(
                f"<b>Process {pid}</b><br>"
                f"Start Time: {block['start']} ms<br>"
                f"End Time: {block['end']} ms<br>"
                f"Duration: {duration} ms<extra></extra>"
            ),
            showlegend=show_in_legend
        ))

    fig.update_layout(
        title=dict(
            text=f"<b>{title}</b>",
            font=dict(size=15, color="#0F172A", family="Segoe UI, sans-serif")
        ),
        barmode="stack",
        height=200,
        margin=dict(l=15, r=15, t=45, b=25),
        plot_bgcolor="#F8FAFC",   # Soft, clean light-slate canvas
        paper_bgcolor="#FFFFFF",  # Pure white background
        font=dict(color="#334155", family="Segoe UI, sans-serif"),
        xaxis=dict(
            title=dict(text="Timeline (Time Units / ms)", font=dict(size=12, color="#475569")),
            dtick=1 if max_time <= 30 else 2,
            range=[0, max_time + 0.5],
            gridcolor="#E2E8F0",
            zerolinecolor="#CBD5E1",
            tickfont=dict(color="#475569", size=11)
        ),
        yaxis=dict(
            showticklabels=False,
            showgrid=False
        ),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.05,
            xanchor="right",
            x=1,
            font=dict(color="#334155", size=11)
        )
    )

    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})
