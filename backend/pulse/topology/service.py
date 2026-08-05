from pydantic import BaseModel


class TopologyEvidence(BaseModel):
    gateway_ip: str | None
    gateway_mac: str | None
    local_direct_frames: int
    gateway_relayed_frames: int
    classification: str
    explanation: str


def classify_topology(
    gateway_ip: str | None,
    gateway_mac: str | None,
    local_direct_frames: int,
    gateway_relayed_frames: int,
) -> TopologyEvidence:
    if not gateway_ip or not gateway_mac:
        classification = "unknown"
        explanation = "Could not resolve a default gateway — nothing to classify yet."

    elif gateway_relayed_frames == 0:
        classification = "insufficient-data"
        explanation = (
            "No traffic to a destination outside your local subnet has been captured yet. "
            "Browse a website or start a download to generate evidence."
        )

    else:
        classification = "star (hub-and-spoke)"
        explanation = (
            f"{gateway_relayed_frames} outbound frame(s) to destinations outside your subnet "
            f"were all addressed at the link layer to your gateway's MAC ({gateway_mac}). "
            "That confirms every external destination is reached through one central point — "
            "the defining trait of a star/hub-and-spoke topology at the network layer. "
            "Note: this is the logical topology as seen from this host. Physical cabling, and "
            "whether other devices reach each other directly, can't be confirmed without a "
            "network-wide vantage point such as a mirrored switch port."
        )
        if local_direct_frames > 0:
            explanation += (
                f" Additionally, {local_direct_frames} frame(s) to other local devices were sent "
                "directly to their own MAC address rather than the gateway's — consistent with a "
                "switched LAN rather than a shared hub."
            )

    return TopologyEvidence(
        gateway_ip=gateway_ip,
        gateway_mac=gateway_mac,
        local_direct_frames=local_direct_frames,
        gateway_relayed_frames=gateway_relayed_frames,
        classification=classification,
        explanation=explanation,
    )