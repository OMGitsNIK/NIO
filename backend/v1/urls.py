from . import views
from django.urls import path

urlpatterns = [
    path("sponge/", views.sponge),
    path("sponge/<id>", views.sponge_id),
    path("sponge/bulk/", views.sponge_bulk),
]
