import socket


def get_local_ip() -> str:
    """Returns this machine's real LAN-facing IP address, avoiding the
    127.0.1.1 loopback alias that socket.gethostbyname(gethostname())
    returns on Debian/Ubuntu systems (and can return incorrectly in
    containers). Opens a UDP socket to a public address without sending
    any actual traffic, purely to ask the OS routing table which local
    interface it would use.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        try:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
        except OSError:
            return "127.0.0.1"