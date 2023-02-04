import channels_graphql_ws
import graphene

from investment_tracker.schema.async_tasks_schema import AsyncTasksType


class AsyncTasksSubscription(channels_graphql_ws.Subscription):
    async_tasks = graphene.List(AsyncTasksType)

    @staticmethod
    def subscribe(root, info):
        return ["group42"]

    @staticmethod
    def publish(async_tasks, info):
        return AsyncTasksSubscription(async_tasks=async_tasks)


class NotificationsSubscription(graphene.ObjectType):
    async_tasks_subscription = AsyncTasksSubscription.Field()
