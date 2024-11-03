from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    RoleViewSet,
    LocationViewSet,
    EstimateViewSet,
    PipelineViewSet,
    BucketViewSet,
    DatasetViewSet,
    SnapshotViewSet,
    FilterViewSet,
    OperationViewSet,
    NNModelViewSet,
    ThreeDModelViewSet,
)

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"roles", RoleViewSet)
router.register(r"locations", LocationViewSet)
router.register(r"estimates", EstimateViewSet)
router.register(r"pipelines", PipelineViewSet)
router.register(r"buckets", BucketViewSet)
router.register(r"datasets", DatasetViewSet)
router.register(r"snapshots", SnapshotViewSet)
router.register(r"filters", FilterViewSet)
router.register(r"operations", OperationViewSet)
router.register(r"nn_models", NNModelViewSet)
router.register(r"three_d_models", ThreeDModelViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
