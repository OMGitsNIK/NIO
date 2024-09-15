from . import views
from django.urls import path

urlpatterns = [
    path("sponge/", views.sponge),
    path("sponge/bulk/", views.sponge_bulk),
]
