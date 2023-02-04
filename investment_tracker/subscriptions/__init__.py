import graphene

from investment_tracker.subscriptions.notifications_subscriptions import NotificationsSubscription


class InvestmentTrackerSubscriptions(NotificationsSubscription, graphene.ObjectType):
    pass
