"""
ASGI config for portfolio project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

import channels
import django
import os
from channels.routing import ProtocolTypeRouter
from django.core.asgi import get_asgi_application

from portfolio.schema import WSConsumer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "portfolio.settings")

django_asgi_app = get_asgi_application()


application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": channels.routing.URLRouter(
            [
                django.urls.path("graphql/", WSConsumer.as_asgi()),
            ]
        ),
    }
)
