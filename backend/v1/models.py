from django.utils import timezone
from django.db import models
import uuid


class Sponges(models.Model):
    created_at = models.DateTimeField(default=timezone.now, blank=False, null=False)
    name = models.TextField()
    size = models.TextField()
    color = models.TextField()
    texture = models.TextField()
    pores = models.TextField()
    habitat = models.TextField()
    location = models.TextField(null=True, blank=True)
    scientific_name = models.TextField(unique=True, primary_key=True)
    description = models.TextField()

    def __str__(self):
        return self.scientific_name


class Images(models.Model):
    sponge = models.ForeignKey(
        Sponges, on_delete=models.CASCADE, related_name="images", null=False
    )
    created_at = models.DateTimeField(default=timezone.now, blank=False, null=False)
    name = models.TextField()
    attribution = models.TextField()
    blob = models.ImageField()

    def __str__(self):
        return f"{self.name}: {self.attribution}"
