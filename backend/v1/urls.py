from django.urls import path
from . import views

urlpatterns = [
    path("<user_id>/dataset/", views.dataset, name="dataset"),
    path("bucket/<id>", views.bucket_id, name="bucket id"),
    path("dataset/<dataset_id>/delete/", views.dataset_delete, name="dataset_delete"),
    path("snapshot", views.snapshot, name="snapshot"),
    path('snapshot/<id>', views.delete_snapshot, name='delete_snapshot'),

    path("bucket", views.bucket, name="bucket"),
    path("analyze/", views.AnalyzeDataset, name="Analyze"),
    path("dataset/<id>", views.dataset_id, name="dataset_id"),
    path("process_image", views.process_image, name="process_image"),
    path('events/', views.events, name='events'),
    path('report/<report_id>', views.report_detail_view, name='report_detail'),

]
