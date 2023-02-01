def start_of_day(dt):
    dt = dt.replace(minute=0, hour=0, second=0, microsecond=0)
    return dt


def end_of_day(dt):
    dt = dt.replace(minute=59, hour=23, second=59, microsecond=999999)
    return dt
