from rest_framework import viewsets

from .permissions import VerifiedBearerTokenPermission
from .models import (
    User,
    Role,
    Location,
    Estimate,
    Pipeline,
    Bucket,
    Dataset,
    Snapshot,
    Filter,
    Operation,
    NNModel,
    ThreeDModel,
)
from .serializers import (
    UserSerializer,
    RoleSerializer,
    LocationSerializer,
    EstimateSerializer,
    PipelineSerializer,
    BucketSerializer,
    DatasetSerializer,
    SnapshotSerializer,
    FilterSerializer,
    OperationSerializer,
    NNModelSerializer,
    ThreeDModelSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [VerifiedBearerTokenPermission]  # Apply custom permission


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer


class EstimateViewSet(viewsets.ModelViewSet):
    queryset = Estimate.objects.all()
    serializer_class = EstimateSerializer


class PipelineViewSet(viewsets.ModelViewSet):
    queryset = Pipeline.objects.all()
    serializer_class = PipelineSerializer


class BucketViewSet(viewsets.ModelViewSet):
    queryset = Bucket.objects.all()
    serializer_class = BucketSerializer


class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer


class SnapshotViewSet(viewsets.ModelViewSet):
    queryset = Snapshot.objects.all()
    serializer_class = SnapshotSerializer


class FilterViewSet(viewsets.ModelViewSet):
    queryset = Filter.objects.all()
    serializer_class = FilterSerializer


class OperationViewSet(viewsets.ModelViewSet):
    queryset = Operation.objects.all()
    serializer_class = OperationSerializer


class NNModelViewSet(viewsets.ModelViewSet):
    queryset = NNModel.objects.all()
    serializer_class = NNModelSerializer


class ThreeDModelViewSet(viewsets.ModelViewSet):
    queryset = ThreeDModel.objects.all()
    serializer_class = ThreeDModelSerializer
