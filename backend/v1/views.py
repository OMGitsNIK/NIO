import io
from django.forms.models import model_to_dict
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from icecream import ic
import json
import logging
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.files.storage import FileSystemStorage
import polars as pl

# Create your views here.
from . import models

logger = logging.getLogger(__name__)


@csrf_exempt
def sponge(request):
    if request.method == "GET":
        sponges = models.Sponges.objects

        query = request.GET.get("q", None)
        if query:
            sponges = sponges.filter(
                Q(name__icontains=query)
                | Q(scientific_name__icontains=query)
                | Q(habitat__icontains=query)
                | Q(location__icontains=query)
                | Q(texture__icontains=query)
                | Q(color__icontains=query)
            )
        limit = int(request.GET.get("limit", 8))

        sponges_list = list(sponges.values())
        if limit > 0:
            sponges_list = sponges_list[:limit]

        return JsonResponse(sponges_list, safe=False)

    if request.method == "POST":
        ic("in post")

        request_data = json.loads(request.body)
        ic(request_data)
        try:
            sponge = models.Sponges.objects.create(
                name=request_data.get("name"),
                size=request_data.get("size"),
                color=request_data.get("color"),
                texture=request_data.get("texture"),
                pores=request_data.get("pores"),
                habitat=request_data.get("habitat"),
                location=request_data.get("location"),
                scientific_name=request_data.get("scientific_name"),
            )
            ic(sponge)
            return JsonResponse(
                {"id": sponge.id, "scientific_name": sponge.scientific_name}, status=201
            )
        except Exception as e:
            logger.error("Error creating sponge: %s", str(e))

            return JsonResponse({"error": str(e)}, status=400)

def sponge_id(request, id):
    ic("sponge")
    ic(id)

    sponge = get_object_or_404(models.Sponges, id=id)
    ic(sponge)

    return JsonResponse(
        model_to_dict(sponge),
        status=201,
    )

@csrf_exempt
def sponge_bulk(request):
    if request.method == "POST" and request.FILES.get("file"):
        file = request.FILES["file"]

        # Check the file extension
        file_extension = file.name.split(".")[-1]

        # Read the file with Polars
        if file_extension in ["csv", "txt"]:
            df = pl.read_csv(file)
        elif file_extension in ["xls", "xlsx"]:
            df = pl.read_excel(io.BytesIO(file.read()))
        else:
            return JsonResponse({"error": "Unsupported file format"}, status=400)
        new_sponges = []
        # Iterate through the DataFrame and save each row to the Sponges model
        for row in df.iter_rows(named=True):
            ic(row)
            try:
                sponge = models.Sponges(
                    name=row["name"],
                    size=row["size"],
                    color=row["color"],
                    texture=row["texture"],
                    pores=row["pores"],
                    habitat=row["habitat"],
                    location=row["location"],
                    scientific_name=row["scientific_name"],
                    description=row["description"],
                )
                sponge.save()  # Save the instance to the database
                if sponge.scientific_name:
                    new_sponges.append(sponge.scientific_name)
            except Exception as e:
                ic(e)
        ic(new_sponges)
        ic(len(new_sponges))
        return JsonResponse({"message": "Sponges imported successfully"}, status=201)

    return JsonResponse({"error": "Invalid request"}, status=400)


@csrf_exempt
def sponge_image_id(request, id):
    if request.method == "POST":
        ic(id)
        ic(request.FILES)
        try:
            sponge = models.Sponges.objects.get(id=id)
            image = models.SpongeImage.objects.create(
                sponge=sponge,
                name=request.POST.get("name", ""),
                attribution=request.POST.get("attribution", ""),
                image=request.FILES.get("image"),
            )
            return JsonResponse({"id": image.id, "name": image.name}, status=201)
        except models.Sponges.DoesNotExist:
            return JsonResponse({"error": "Sponge not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    elif request.method == "GET":
        try:
            image = get_object_or_404(models.SpongeImage, sponge_id=id)
            return FileResponse(open(image.image.path, "rb"), content_type="image/jpeg")
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
@csrf_exempt
def image(request, id):
    if request.method == "POST":
        try:
            sponge = models.Sponges.objects.get(id=id)
            image = models.SpongeImage.objects.create(
                sponge=sponge,
                name=request.POST.get("name"),
                attribution=request.POST.get("attribution"),
                image=request.FILES.get("image"),
            )
            return JsonResponse({"id": image.id, "name": image.name}, status=201)
        except models.Sponges.DoesNotExist:
            return JsonResponse({"error": "Sponge not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    elif request.method == "GET":
        try:
            image = get_object_or_404(models.SpongeImage, sponge_id=id)
            return FileResponse(open(image.image.path, "rb"), content_type="image/jpeg")
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
