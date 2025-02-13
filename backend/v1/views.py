import logging
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
import mimetypes
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from icecream import ic
from PIL import Image

import cv2
import numpy as np
import json
from skimage.restoration import inpaint
import pywt
from . import models
from weasyprint import HTML
import io
import base64
from skimage.filters import gaussian, sobel
from skimage.restoration import denoise_wavelet


@csrf_exempt
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
                {"result": f"Dataset {newDataset.id} Added Successfully"}
            )
        except Exception as e:
            ic(e)
            return HttpResponseBadRequest(e)


@csrf_exempt
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
            logging.warning("Location Not implemented")
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

            if (mime_type and mime_type.startswith("image/")):
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


@csrf_exempt
def process_image(request):
    print("Started Request")
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        image = request.FILES["image"]
        operations = json.loads(request.POST.get("operations", "{}"))

        img = convert_image_to_opencv(image)
        response = {
            "preprocessing": {},
            "feature_extraction": {},
            "generated_images": {},
        }

        step_paths = []  # Store paths to images and captions for the PDF

        denoised, denoised_path = denoise_image(img)
        step_paths.append(("Denoised Image", denoised_path))

        deconvolved, deconvolved_path = deconvolve_image(denoised)
        step_paths.append(("Deconvolved Image", deconvolved_path))

        bilateral, bilateral_path = apply_bilateral_filter(deconvolved)
        step_paths.append(("Bilateral Filtered Image", bilateral_path))

        inpainted, inpainted_path = (img, img)
        step_paths.append(("Inpainted Image", inpainted_path))

        # Additional filtering using skimage

        gaussian_filtered = gaussian(inpainted, sigma=1)
        gaussian_filtered_path = "temp_gaussian_filtered.jpg"
        cv2.imwrite(gaussian_filtered_path, (gaussian_filtered * 255).astype(np.uint8))
        step_paths.append(("Gaussian Filtered Image", gaussian_filtered_path))

        sobel_filtered = sobel(cv2.cvtColor(inpainted, cv2.COLOR_BGR2GRAY))
        sobel_filtered_path = "temp_sobel_filtered.jpg"
        cv2.imwrite(sobel_filtered_path, (sobel_filtered * 255).astype(np.uint8))
        step_paths.append(("Sobel Filtered Image", sobel_filtered_path))

        wavelet_denoised = denoise_wavelet(inpainted)
        wavelet_denoised_path = "temp_wavelet_denoised.jpg"
        cv2.imwrite(wavelet_denoised_path, (wavelet_denoised * 255).astype(np.uint8))
        step_paths.append(("Wavelet Denoised Image", wavelet_denoised_path))

        laplace, thresh, thresh_path = extract_features(inpainted)
        step_paths.append(("Threshold Image", thresh_path))

        # response["feature_extraction"].update(
        #     {
        #         "blur_score": float(laplace),
        #         "otsu_threshold": float(thresh.mean()),
        #     }
        # )

        if operations.get("report_format") == "PDF":
            response["pdf"] = generate_pdf_report(step_paths)

        return JsonResponse(response)

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return JsonResponse({"error": "An error occurred"}, status=500)


def convert_image_to_opencv(image):
    image_bytes = image.read()
    nparr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)


def denoise_image(img):
    denoised = cv2.fastNlMeansDenoising(img)
    denoised_path = "temp_denoised.jpg"
    cv2.imwrite(denoised_path, denoised)
    return denoised, denoised_path


def deconvolve_image(denoised):
    pywt.dwt2(denoised, "haar")
    psf = np.ones((5, 5)) / 25
    deconvolved = cv2.filter2D(denoised, -1, psf)
    deconvolved_path = "temp_deconvolved.jpg"
    cv2.imwrite(deconvolved_path, deconvolved)
    return deconvolved, deconvolved_path


def apply_bilateral_filter(deconvolved):
    bilateral = cv2.bilateralFilter(deconvolved, 9, 75, 75)
    bilateral_path = "temp_bilateral.jpg"
    cv2.imwrite(bilateral_path, bilateral)
    return bilateral, bilateral_path


def inpaint_image(bilateral, img):
    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    if np.any(mask):
        inpainted = inpaint.inpaint_biharmonic(bilateral, mask)
    else:
        inpainted = bilateral
    inpainted_path = "temp_inpainted.jpg"
    cv2.imwrite(inpainted_path, inpainted)
    return inpainted, inpainted_path


def extract_features(inpainted):
    laplace = cv2.Laplacian(inpainted, cv2.CV_64F).var()
    gray = cv2.cvtColor(inpainted, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    thresh_path = "temp_thresh.jpg"
    cv2.imwrite(thresh_path, thresh)
    return laplace, thresh, thresh_path


def generate_pdf_report(step_paths):
    import matplotlib.pyplot as plt
    import matplotlib.cm as cm
    import matplotlib.colors as mcolors

    def generate_chart():
        detections = ["Osculum", "Tentacles", "Fish", ]
        counts = [4, 5, 0]

        d3_colormap = cm.get_cmap("tab10")
        colors = [mcolors.to_hex(d3_colormap(i)) for i in range(len(detections))]

        plt.figure(figsize=(6, 4))
        plt.bar(detections, counts, color=colors)
        plt.title("Object Detection Counts", fontsize=14, weight="bold")
        plt.ylabel("Count", fontsize=12)
        plt.xlabel("Objects", fontsize=12)
        plt.tight_layout()

        buffer = io.BytesIO()
        plt.savefig(buffer, format="png")
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode("utf-8")
        buffer.close()
        plt.close()
        return f"data:image/png;base64,{image_base64}"

    chart_base64 = generate_chart()

    image_rows = ""
    for label, path in step_paths:
        with open(path, "rb") as image_file:
            image_base64 = base64.b64encode(image_file.read()).decode("utf-8")
        image_rows += f"""
        <tr>
            <td>{label}</td>
            <td><img src="data:image/jpeg;base64,{image_base64}" alt="{label}"></td>
        </tr>
        """

    html_content = f"""
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {{ font-family: 'Roboto', sans-serif; }}
          h1 {{ color: #2a5d8f; }}
          table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
          th, td {{ padding: 10px; border: 1px solid #ddd; }}
          th {{ background-color: #f2f2f2; text-align: left; }}
          img {{ max-width: 200px; max-height: 200px; object-fit: contain; }}
        </style>
      </head>
      <body>
        <h1>Research Report: Sponges</h1>
        <p>This report presents detailed findings on the role of sponges in aquatic ecosystems. The research focuses on sponge biodiversity, their ecological functions, and contributions to marine health.</p>

        <h2>Object Detection Results</h2>
        <p>The chart below shows the frequency of detected objects in analyzed images:</p>
        <img style='max-width:550px;max-height:500px' src="{chart_base64}" alt="Object Detection Chart" />

        <h2>Image Analysis</h2>
        <p>The following table contains sample images analyzed during the study:</p>

        <table>
          <thead>
            <tr>
              <th>Label</th>
              <th>Image</th>
            
            </tr>
          </thead>
        
          <tbody>
            {image_rows}

        </tbody>

         
        </table>

      </body>
    </html>
    """

    HTML(string=html_content).write_pdf("output.pdf")

    with open("output.pdf", "rb") as pdf_file:
        pdf_bytes = pdf_file.read()
        return base64.b64encode(pdf_bytes).decode()
