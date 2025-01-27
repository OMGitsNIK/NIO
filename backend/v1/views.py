from ast import mod
import logging
import os
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
import mimetypes

import base64

from django.shortcuts import get_object_or_404
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils import dateparse, timezone
from datetime import datetime, timedelta
from executing import version
from icecream import ic
import bcrypt
import requests
from PIL import Image
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from PIL import Image
import cv2
import numpy as np
import json
from fpdf import FPDF
from ultralytics import YOLO
from transformers import pipeline
from skimage.restoration import denoise_nl_means, inpaint
import pywt
from io import BytesIO
from . import models


@csrf_exempt
# @cache_page(60 * 15)
def dataset(request):
    if request.method == "GET":
        datasets = models.DatasetBridge.objects.all().values(
            "dataset_id",
            "dataset__name",
            "dataset__description",
            "dataset__visibility",
            "dataset__created_by_id",
            "dataset__created_at",
        )

        dataset_list = []
        for dataset in datasets:
            snapshots = models.Snapshot.objects.filter(
                id__in=models.DatasetSnapshotBridge.objects.filter(
                    dataset_bridge__dataset_id=dataset["dataset_id"]
                ).values_list("snapshot_id", flat=True)
            ).values(
                "id", "media__file", "location", "created_on", "version", "media__id"
            )

            for snapshot in snapshots:
                snapshot["src"] = "/v1/bucket/" + str(snapshot["media__id"])

            dataset["snapshots"] = list(snapshots)[:1]
            dataset["num_items"] = len(list(snapshots))
            dataset_list.append(dataset)

        return JsonResponse(dataset_list, safe=False)

    if request.method == "POST":
        ic("in post")
        ic(request.body)
        try:
            ic(request.POST.get("user_id"))
            user = get_object_or_404(models.User, id=request.POST.get("user_id"))

            newDataset = models.Dataset(
                name=request.POST.get("name"),
                visibility=request.POST.get("visibility", "private"),
                created_by=user,
                description=request.POST.get("description"),
            )

            newDataset.save()

            newDBBridge = models.DatasetBridge(dataset=newDataset, version=0)
            newDBBridge.save()
            ic(newDataset)
            ic(f"Saved Dataset, ID:  {newDBBridge.id}")

            return JsonResponse(
                {"result": f"Dataset {newDataset.id} Added Sucessfully"}
            )
        except Exception as e:
            ic(e)
            return HttpResponseBadRequest(e)


@csrf_exempt
# @cache_page(60 * 15)
def dataset_id(request, id):
    if request.method == "GET":
        dataset = get_object_or_404(models.DatasetBridge, dataset_id=id)

        snapshots = []
        for snapshot in models.DatasetSnapshotBridge.objects.filter(
            dataset_bridge=dataset
        ).values("snapshot_id"):
            snapshot = models.Snapshot.objects.get(id=snapshot["snapshot_id"])
            snapshots.append(
                {
                    "id": snapshot.id,
                    "src": "/v1/bucket/" + str(snapshot.media.id),
                    "created_on": snapshot.created_on,
                    "version": snapshot.version,
                }
            )

        print(dataset)
        return JsonResponse(
            {
                "name": dataset.dataset.name,
                "description": dataset.dataset.description,
                "created_at": dataset.dataset.created_at,
                "snapshots": snapshots,
            },
            safe=False,
        )

    if request.method == "POST":
        ic("in post")
        ic(request.body)
        try:
            user = get_object_or_404(models.User, id=request.POST.get("user_id"))

            newDataset = models.Dataset(
                name=request.POST.get("name"),
                visibility=request.POST.get("visibility", "private"),
                created_by=user,
                description=request.POST.get("description"),
            )

            newDataset.save()

            newDBBridge = models.DatasetBridge(dataset=newDataset, version=0)
            newDBBridge.save()
            ic(newDataset)
            ic(f"Saved Dataset, ID:  {newDBBridge.id}")

            return JsonResponse(
                {"result": f"Dataset {newDataset.id} Added Sucessfully"}
            )
        except Exception as e:
            ic(e)
            return HttpResponseBadRequest(e)


@csrf_exempt
def snapshot(request):
    if request.method == "POST":
        file = request.FILES.get("file")
        ic(request.POST)
        ic(request.FILES)
        ic(file)
        user = get_object_or_404(models.User, id=request.POST.get("user_id"))
        name = request.POST.get("name")
        dataset_id = request.POST.get("dataset_id")
        ic(dataset_id)
        ic(user)
        if file and user:
            logging.warning("Location Not implemeted")
            current_location = models.Location()
            current_location.save()
            media = models.Bucket(file=file, name=name, created_by=user)
            media.save()

            # Create the snapshot
            new_snapshot = models.Snapshot(
                media=media, location=current_location, created_by=user, version=0
            )
            new_snapshot.save()

            new_link = models.DatasetSnapshotBridge(
                dataset_bridge=models.DatasetBridge.objects.get(dataset_id=dataset_id),
                snapshot=new_snapshot,
            )
            new_link.save()

            return JsonResponse(
                {"status": "success", "id": str(new_snapshot.id)}, status=201
            )

    return JsonResponse(
        {"status": "error", "message": "Invalid request method"}, status=405
    )


@csrf_exempt
def bucket(request):
    ####################
    ####################
    if request.method == "GET":
        _bucket = models.Bucket.objects.all().values()
        limit = request.GET.get("limit", False)
        if limit:
            _bucket = _bucket[: int(limit)]

        return JsonResponse(list(_bucket), safe=False)

    if request.method == "POST":
        file = request.FILES.get("file")
        ic(request.POST)
        ic(request.FILES)
        ic(file)
        user = get_object_or_404(models.User, id=request.POST.get("user_id"))
        name = request.POST.get("name")
        ic(user)
        ic(file)
        if file:
            media = models.Bucket(file=file, name=name, created_by=user)
            media.save()
            return JsonResponse(
                {
                    "status": "success",
                    "id": str(media.id),
                    # "caption": media.caption,
                }
            )
        else:
            return JsonResponse(
                {"status": "error", "message": "Bucket name not provided"}, status=400
            )

    else:
        return JsonResponse(
            {"status": "error", "message": "Invalid request method"}, status=405
        )


def bucket_id(request, id):
    bucket_file = get_object_or_404(models.Bucket, id=id)

    if request.method == "DELETE":
        bucket_file.delete()
        return JsonResponse({"message": f"Successfully Deleted {id}"}, safe=False)

    if request.method == "GET":
        try:
            max_size = int(request.GET.get("size", 2000))
            quality = int(request.GET.get("quality", 100))
            mime_type, _ = mimetypes.guess_type(bucket_file.file.url)

            if mime_type and mime_type.startswith("image/"):
                bucket_file_actual_image = Image.open(bucket_file.file.path)
                original_width, original_height = bucket_file_actual_image.size
                aspect_ratio = original_width / original_height

                new_width, new_height = (
                    (max_size, int(max_size / aspect_ratio))
                    if original_width > original_height
                    else (int(max_size * aspect_ratio), max_size)
                )
                # Resize the image
                if bucket_file_actual_image.mode == "RGBA":
                    bucket_file_actual_image = bucket_file_actual_image.convert("RGB")

                # Resize and save the image
                resized_image = bucket_file_actual_image.resize(
                    (new_width, new_height), Image.Resampling.BICUBIC
                )
                response = HttpResponse(content_type="image/jpeg")
                resized_image.save(response, "JPEG", quality=quality)

                if request.GET.get("json") == "true":
                    response_data = {
                        "id": bucket_file.id,
                        "name": bucket_file.name,
                        "file": bucket_file.file.url,
                        "size": bucket_file.file.size,
                        "created_by": {
                            "id": bucket_file.created_by.id,
                            "name": bucket_file.created_by.name,
                        },
                        "created_on": bucket_file.created_on,
                    }

                    return JsonResponse(response_data)
                return response
        except ValueError:
            return HttpResponse("Invalid size parameter", status=400)
        except FileNotFoundError:
            return HttpResponse("Image file not found", status=404)


# @csrf_exempt
# # @cache_page(60 * 15)
# def dataset_id(request):
#     ic(request)
#     if request.method == "GET":

#         mock=[
#             {
#                 name:'Maharashtra DS',
#                 thumbnail:'http://localhost:8000/v1/bucket/e83339a0-da1f-4f02-a59c-927f8eb63674',
#                 description:'',
#                 count:12,
#                 createdDate:datetime.now()
#             }
#         ]

#         return JsonResponse(mock, safe=False)

#     if request.method == "POST":
#         ic("in post")
#         if not authenticated(request=request):
#             ic("not authenticated")

#             return JsonResponse(
#                 {"result": "YOU ARE NOT ALLOWED"}
#             )  # TODO : REPLACE WITH PROPER CODE
#         else:
#             ic("authenticated")

#             try:
#                 ic(request.body)
#                 data = json.loads(request.body)
#                 ic(data)
#                 # ic(request.POST.get("user_id"))

#                 user = get_object_or_404(models.User, id=data.get("user_id"))
#                 team = get_object_or_404(models.Team, id=data.get("team_id"))

#                 if request.GET.get("new_article", False):
#                     print("make a blank article")
#                     newArticle = models.Article(
#                         title="",
#                         subtitle="",
#                         content="",
#                         publish_date=(
#                             datetime.now() + timedelta(days=365 * 100)
#                         ).date(),
#                         category=None,
#                         views=0,
#                         shares=0,
#                         image=None,
#                         user=user,
#                         draft=True,
#                         team=team,
#                     )
#                     ic(data)
#                     newArticle.save()
#                     return JsonResponse(
#                         {"result": "Article Added Successfully", "id": newArticle.id}
#                     )
#                 else:
#                     ic("NOT A DRAFT")

#                     category = get_object_or_404(
#                         models.ArticleCategories, id=data["category_id"]
#                     )
#                     ic(category.name)
#                     newArticle = models.Article(
#                         title=data["title"],
#                         subtitle=data["subtitle"],
#                         content=data["content"],
#                         publish_date=dateparse.parse_date(data["publish_date"]),
#                         category=category,
#                         views=0,
#                         shares=0,
#                         image=data["image"],
#                         user=user,  # TODO WE GET IT WITH THE REQUEST ....
#                         draft=False,
#                         team=team,
#                     )

#                     ic(newArticle)
#                     newArticle.save()
#                     ic("saved")

#                     for _tag in data["tags"]:
#                         ic(_tag)
#                         ic(newArticle)

#                         models.ArticleTag.objects.create(
#                             tag=tag_add(_tag), article=newArticle
#                         )
#                     ic("Done")

#                     return JsonResponse(
#                         {"result": f"Article {newArticle.id} Added Sucessfully"}
#                     )
#             except Exception as e:
#                 ic(e)
#                 return HttpResponseBadRequest(e)

#     # Add An Article
@csrf_exempt
def process_image(request):
    print("Started Request")
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        image = request.FILES["image"]
        operations = json.loads(request.POST.get("operations", "{}"))

        # Convert image file to OpenCV format
        image_bytes = image.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        response = {
            "preprocessing": {},
            "feature_extraction": {},
            "generated_images": {},
        }

        # Preprocessing
        step_paths = []  # Store paths to images and captions for the PDF

        denoised = cv2.fastNlMeansDenoising(img)
        denoised_path = "temp_denoised.jpg"
        cv2.imwrite(denoised_path, denoised)
        step_paths.append(("Denoised Image", denoised_path))

        coeffs = pywt.dwt2(denoised, "haar")
        psf = np.ones((5, 5)) / 25
        deconvolved = cv2.filter2D(denoised, -1, psf)
        deconvolved_path = "temp_deconvolved.jpg"
        cv2.imwrite(deconvolved_path, deconvolved)
        step_paths.append(("Deconvolved Image", deconvolved_path))

        bilateral = cv2.bilateralFilter(deconvolved, 9, 75, 75)
        bilateral_path = "temp_bilateral.jpg"
        cv2.imwrite(bilateral_path, bilateral)
        step_paths.append(("Bilateral Filtered Image", bilateral_path))

        mask = np.zeros(img.shape[:2], dtype=np.uint8)
        if np.any(mask):
            inpainted = inpaint.inpaint_biharmonic(bilateral, mask)
        else:
            inpainted = bilateral
        inpainted_path = "temp_inpainted.jpg"
        cv2.imwrite(inpainted_path, inpainted)
        step_paths.append(("Inpainted Image", inpainted_path))

        try:
            model = YOLO("public/best.pt")
            results = model(inpainted)
            results[0].save("public/op.jpg")
            yolo_result_path = "public/op.jpg"
            step_paths.append(("YOLO Detection Results", yolo_result_path))

            if results[0].boxes:
                class_ids = results[0].boxes.cls.cpu().numpy().astype(int)
                counts = {
                    "tentacles": len([cls_id for cls_id in class_ids if cls_id == 0]),
                    "osculum": len([cls_id for cls_id in class_ids if cls_id == 1]),
                }
            else:
                counts = {"tentacles": 0, "osculum": 0}

        except Exception as e:
            counts = {"tentacles": 0, "osculum": 0}

        # Feature Extraction
        laplace = cv2.Laplacian(inpainted, cv2.CV_64F).var()
        gray = cv2.cvtColor(inpainted, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        thresh_path = "temp_thresh.jpg"
        cv2.imwrite(thresh_path, thresh)
        step_paths.append(("Threshold Image", thresh_path))

        depth_pipe = pipeline("depth-estimation", model="Intel/dpt-hybrid-midas")
        depth_result = depth_pipe(Image.fromarray(inpainted))
        depth_map = np.array(depth_result["predicted_depth"])  # Convert to numpy array
        depth_map_path = "temp_depth_map.jpg"
        depth_map_normalized = cv2.normalize(
            depth_map, None, 0, 255, cv2.NORM_MINMAX
        ).astype(np.uint8)
        cv2.imwrite(depth_map_path, depth_map_normalized)
        step_paths.append(("Depth Map", depth_map_path))

        response["feature_extraction"].update(
            {
                "counts": counts,
                "blur_score": float(laplace),
                "otsu_threshold": float(thresh.mean()),
                "depth_estimation": float(depth_map.mean()),
            }
        )

        # Generate PDF if requested
        if operations.get("report_format") == "PDF":
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", "B", 16)
            pdf.cell(0, 10, "Image Analysis Report", ln=True, align="C")

            pdf.set_font("Arial", "", 12)
            for category, data in response.items():
                pdf.ln(10)
                pdf.cell(0, 10, f"{category.upper()}:", ln=True)
                for key, value in data.items():
                    pdf.cell(0, 10, f"{key}: {value}", ln=True)

            pdf.add_page()
            pdf.set_font("Arial", "B", 14)
            pdf.cell(0, 10, "Processing Steps", ln=True, align="C")

            for caption, img_path in step_paths:
                pdf.ln(5)
                pdf.cell(0, 10, caption, ln=True)
                pdf.image(img_path, x=10, y=None, w=190)

            # Convert PDF to bytes
            pdf_bytes = pdf.output(dest="S").encode("latin1")
            response["pdf"] = base64.b64encode(pdf_bytes).decode()

        return JsonResponse(response)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)