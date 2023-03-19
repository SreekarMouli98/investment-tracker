def apply_limit_offset_order_by(qs, limit=None, offset=None, order_by=None):
    if order_by:
        qs = qs.order_by(*order_by)
    if offset is not None and limit is not None:
        qs = qs[offset : offset + limit]
    return qs
