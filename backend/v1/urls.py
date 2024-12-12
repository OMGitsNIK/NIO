from django.urls import path
from . import views

urlpatterns = [
    path("dataset", views.dataset, name="dataset"),
    # path("dataset/<id>", views.dataset_id, name="dataset_id"),
  
]
