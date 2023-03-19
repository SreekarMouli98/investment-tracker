from investment_tracker.models import TransactionsModel
from investment_tracker.utils.db_utils import apply_limit_offset_order_by


class TransactionsAccessor:
    def persist(self, transaction):
        transaction.save()
        return transaction

    def get_transactions(self, after_date=None, limit=None, offset=None, order_by=None):
        qs = TransactionsModel.objects.filter()
        if after_date:
            qs = qs.filter(transacted_at__gte=after_date)
        apply_limit_offset_order_by(qs, limit=limit, offset=offset, order_by=order_by)
        return list(qs)

    def get_transaction_by_id(self, transaction_id):
        return TransactionsModel.objects.get(id=transaction_id)

    def update_transaction(self, transcation_id, **updates):
        return TransactionsModel.objects.filter(id=transcation_id).update(**updates)

    def count_transactions(self):
        qs = TransactionsModel.objects.filter()
        return qs.count()
