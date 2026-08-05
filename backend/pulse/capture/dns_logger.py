from scapy.all import DNS, DNSQR, DNSRR

from pulse.database.db import insert_dns_query


def extract_dns_query(packet) -> None:
    if not packet.haslayer(DNS):
        return

    dns = packet[DNS]

    # qr=1 means this is a response (has the answer); qr=0 is just the question
    if dns.qr != 1 or dns.ancount == 0:
        return

    if not packet.haslayer(DNSQR):
        return

    domain = packet[DNSQR].qname.decode(errors="ignore").rstrip(".")

    resolved_ips = []
    for i in range(dns.ancount):
        answer = dns.an[i] if dns.ancount > 1 else dns.an
        if isinstance(answer, DNSRR) and answer.type in (1, 28):  # A or AAAA
            ip = answer.rdata
            resolved_ips.append(ip if isinstance(ip, str) else ip.decode(errors="ignore"))

    insert_dns_query(
        timestamp=packet.time,
        domain=domain,
        resolved_ips=",".join(resolved_ips) if resolved_ips else None,
    )