from django.urls import path
from . import views

urlpatterns = [
    path("dataset", views.dataset, name="dataset"),
    path("bucket/<id>", views.bucket_id, name="bucket id"),
    path("snapshot", views.snapshot, name="snapshot"),
    path("bucket", views.bucket, name="bucket"),
    path("dataset/<id>", views.dataset_id, name="dataset_id"),
    path("process_image", views.process_image, name="process_image"),
]
