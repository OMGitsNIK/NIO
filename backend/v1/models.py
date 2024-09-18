from django.utils import timezone
from django.db import models
import uuid


class Sponges(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now, blank=False, null=False)
    name = models.TextField()
    size = models.TextField()
    color = models.TextField()
    texture = models.TextField()
    pores = models.TextField()
    habitat = models.TextField()
    location = models.TextField(null=True, blank=True)
    scientific_name = models.TextField(unique=True)
    description = models.TextField()

    def __str__(self):
        return self.scientific_name


class SpongeImage(models.Model):
    sponge = models.OneToOneField(
        Sponges, on_delete=models.CASCADE, related_name="image"
    )
    created_at = models.DateTimeField(default=timezone.now, blank=False, null=False)
    name = models.TextField()
    attribution = models.TextField()
    image = models.ImageField(upload_to="sponges/")

    def __str__(self):
        return f"Image for {self.sponge.scientific_name}"
