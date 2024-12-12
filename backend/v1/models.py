from datetime import datetime
from django.db import models
import uuid
from django.utils import timezone


class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField()
    email = models.EmailField(unique=True, blank=False, null=False)
    roles = models.ManyToManyField("Role", related_name="users", blank=True)


class Role(models.Model):
    name = models.TextField(unique=True, blank=False)


class Location(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    title = models.TextField(default="")
    description = models.TextField(default="")


class Estimate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.TextField()
    parameters = models.JSONField()
    output = models.JSONField()


class Pipeline(models.Model):
    name = models.TextField()
    description = models.TextField()


class Bucket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    blob = models.FileField(upload_to="bucket/")
    name = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)


class Dataset(models.Model):
    name = models.TextField()
    visibility = models.CharField(
        max_length=7, choices=[("public", "Public"), ("private", "Private")]
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)


class Snapshot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    media_type = models.CharField(
        max_length=7, choices=[("image", "Image"), ("video", "Video")]
    )
    media = models.ForeignKey(Bucket, on_delete=models.CASCADE)
    location = models.JSONField()
    time = models.DateTimeField(default=timezone.now)
    version = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)


class Filter(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    output = models.ForeignKey(Bucket, on_delete=models.CASCADE)
    name = models.TextField()
    parameters = models.JSONField()


class DatasetBridge(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    version = models.PositiveIntegerField(default=0)


class Operation(models.Model):
    type = models.CharField(
        max_length=12, choices=[("filter", "Filter"), ("estimate", "Estimate")]
    )
    status = models.CharField(
        max_length=12,
        choices=[
            ("pending", "Pending"),
            ("running", "Running"),
            ("complete", "Complete"),
            ("failed", "Failed"),
        ],
    )
    order = models.PositiveIntegerField(default=0)
    transferred_attributes = models.JSONField()
    reference = models.UUIDField(editable=True)


class DatasetSnapshotBridge(models.Model):
    dataset_bridge = models.ForeignKey(DatasetBridge, on_delete=models.CASCADE)
    snapshot = models.ForeignKey(Snapshot, on_delete=models.CASCADE)


class NNModel(models.Model):
    dataset_bridge = models.ForeignKey(DatasetBridge, on_delete=models.CASCADE)
    type = models.CharField(
        max_length=20,
        choices=[
            ("classification", "Classification"),
            ("detection", "Detection"),
        ],
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    trained = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    version = models.PositiveIntegerField(default=0)
    nn_model = models.ForeignKey(Bucket, on_delete=models.CASCADE)


class ThreeDModel(models.Model):
    dataset_bridge = models.ForeignKey(DatasetBridge, on_delete=models.CASCADE)
    type = models.CharField(
        max_length=20,
        choices=[
            ("obj", "obj"),
            ("fbx", "fbx"),
            ("splat", "splat"),
            ("gltf", "gltf"),
        ],
    )

    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    version = models.PositiveIntegerField(default=0)

    three_d_model = models.ForeignKey(Bucket, on_delete=models.CASCADE)


class DatasetUsersBridge(models.Model):
    access = models.CharField(
        max_length=8,
        choices=[
            ("read", "Read"),
            ("write", "Write"),
        ],
    )
    dataset_bridge = models.ForeignKey(DatasetBridge, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class SnapshotOperationBridge(models.Model):
    snapshot = models.ForeignKey(Snapshot, on_delete=models.CASCADE)
    operation = models.ForeignKey(Operation, on_delete=models.CASCADE)


class PipelineOperationBridge(models.Model):
    pipeline = models.ForeignKey(Pipeline, on_delete=models.CASCADE)
    operation = models.ForeignKey(Operation, on_delete=models.CASCADE)
