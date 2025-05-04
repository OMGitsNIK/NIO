from datetime import datetime
from django.db import models
import uuid
from django.utils import timezone


class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField()
    email = models.EmailField(unique=True, blank=False, null=False)
    roles = models.ManyToManyField("Role", related_name="users", blank=True)
    password = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    last_seen = models.DateTimeField(auto_now=True)


class Role(models.Model):
    name = models.TextField(unique=True, blank=False)


class Location(models.Model):
    latitude = models.FloatField(default=0)
    longitude = models.FloatField(default=0)
    altitude = models.FloatField(default=0)
    title = models.TextField(default="")
    description = models.TextField(default="")


# class Estimate(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     name = models.TextField()
#     parameters = models.JSONField()
#     output = models.JSONField()


# class Pipeline(models.Model):
#     name = models.TextField()
#     description = models.TextField()


class Bucket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to="public/")
    name = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_on=models.DateTimeField(default=timezone.now)


class Dataset(models.Model):
    id=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField()
    visibility = models.CharField(
        max_length=7, choices=[("public", "Public"), ("private", "Private")]
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    description = models.TextField(default="")


class Snapshot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    media = models.ForeignKey(Bucket, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    created_on = models.DateTimeField(default=timezone.now)
    version = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

class DatasetBridge(models.Model):
    id=models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    version = models.PositiveIntegerField(default=0)

class DatasetSnapshotBridge(models.Model):
    dataset_bridge = models.ForeignKey(DatasetBridge, on_delete=models.CASCADE)
    snapshot = models.ForeignKey(Snapshot, on_delete=models.CASCADE)


# class Filter(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     output = models.ForeignKey(Bucket, on_delete=models.CASCADE)
#     name = models.TextField()
#     parameters = models.JSONField()


# class Operation(models.Model):
#     type = models.CharField(
#         max_length=12, choices=[("filter", "Filter"), ("estimate", "Estimate")]
#     )
#     status = models.CharField(
#         max_length=12,
#         choices=[
#             ("pending", "Pending"),
#             ("running", "Running"),
#             ("complete", "Complete"),
#             ("failed", "Failed"),
#         ],
#     )
#     order = models.PositiveIntegerField(default=0)
#     transferred_attributes = models.JSONField()
#     reference = models.UUIDField(editable=True)




# class NNModel(models.Model):
#     dataset_bridge = models.ForeignKey(DatasetBridge, on_delete=models.CASCADE)
#     type = models.CharField(
#         max_length=20,
#         choices=[
#             ("classification", "Classification"),
#             ("detection", "Detection"),
#         ],
#     )
#     created_by = models.ForeignKey(User, on_delete=models.CASCADE)
#     trained = models.BooleanField(default=False)
#     created_at = models.DateTimeField(default=timezone.now)
#     version = models.PositiveIntegerField(default=0)
#     nn_model = models.ForeignKey(Bucket, on_delete=models.CASCADE)


# class ThreeDModel(models.Model):
#     dataset_bridge = models.ForeignKey(DatasetBridge, on_delete=models.CASCADE)
#     type = models.CharField(
#         max_length=20,
#         choices=[
#             ("obj", "obj"),
#             ("fbx", "fbx"),
#             ("splat", "splat"),
#             ("gltf", "gltf"),
#         ],
#     )

#     created_by = models.ForeignKey(User, on_delete=models.CASCADE)
#     created_at = models.DateTimeField(default=timezone.now)
#     version = models.PositiveIntegerField(default=0)

#     three_d_model = models.ForeignKey(Bucket, on_delete=models.CASCADE)


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


# class SnapshotOperationBridge(models.Model):
#     snapshot = models.ForeignKey(Snapshot, on_delete=models.CASCADE)
#     operation = models.ForeignKey(Operation, on_delete=models.CASCADE)


# class PipelineOperationBridge(models.Model):
#     pipeline = models.ForeignKey(Pipeline, on_delete=models.CASCADE)
#     operation = models.ForeignKey(Operation, on_delete=models.CASCADE)


class Report(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name="reports")
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who generated the report
    report_file = models.FileField(upload_to="reports/")  # The actual report file
    created_at = models.DateTimeField(default=timezone.now)  # When the report was generated
    status = models.CharField(
        max_length=12,
        choices=[("pending", "Pending"), ("completed", "Completed"), ("failed", "Failed")],
        default="pending"
    )
    results = models.ManyToManyField(Snapshot, related_name="reports")  # Results of the report (snapshots)
    def __str__(self):
        return f"Report for Dataset {self.dataset.name} by {self.user.name}"
