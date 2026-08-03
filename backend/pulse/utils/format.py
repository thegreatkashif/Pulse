def bytes_to_human(num: int) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]

    value = float(num)

    for unit in units:
        if value < 1024:
            return f"{value:.1f} {unit}"
        value /= 1024

    return f"{value:.1f} PB"