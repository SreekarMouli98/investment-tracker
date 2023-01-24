from django.utils import timezone

from investment_tracker.models import TransactionsModel


class TransactionsAccessor:
    def persist(self, transaction):
        transaction.save()
        return transaction

    def get_transactions(self, limit=None, offset=None, order_by=None):
        qs = TransactionsModel.objects.filter()
        if order_by:
            qs = qs.order_by(*order_by)
        if offset is not None and limit is not None:
            qs = qs[offset : offset + limit]
        return list(qs)

    def get_transaction_by_id(self, transaction_id):
        return TransactionsModel.objects.get(id=transaction_id)

    def update_transaction(self, transcation_id, **updates):
        return TransactionsModel.objects.filter(id=transcation_id).update(**updates)

    def count_transactions(self):
        qs = TransactionsModel.objects.filter()
        return qs.count()
