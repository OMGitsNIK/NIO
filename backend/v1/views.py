import logging
import threading
from .lib.cv import apply_bilateral_filter, convert_image_to_opencv, deconvolve_image, denoise_image, extract_features
from .lib.report_gen import generate_pdf_report
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
import io
import base64
from skimage.filters import gaussian, sobel
from skimage.restoration import denoise_wavelet

import time
from django.http import StreamingHttpResponse

sse_clients = []

def events(request):
    def event_stream():
        while True:
            if sse_clients:
                client = sse_clients.pop(0)
                logging.info(f"Sending data to client: {client}")
                yield f"data: {json.dumps(client)}\n\n"
            time.sleep(1)  # Prevent excessive CPU usage

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")

def alert_frontend(message: str, progress: int, type=''):
    sse_clients.append({"message": message, "progress": progress,"type":type})
    print(f"Alerted Frontend: {message} ({progress}%)")

@csrf_exempt
def dataset_delete(request, dataset_id: int):
    if request.method == "DELETE":
        try:
            dataset_bridge = get_object_or_404(models.DatasetBridge, dataset_id=dataset_id)
            dataset = dataset_bridge.dataset
            dataset_bridge.delete()
            dataset.delete()
            return JsonResponse({"message": f"Dataset {dataset_id} deleted successfully"}, status=200)
        except Exception as e:
            logging.error(f"Delete failed: {e}")
            return JsonResponse({"error": "Failed to delete dataset"}, status=500)
    else:
        return JsonResponse({"error": "Invalid method"}, status=405)


# def users
@csrf_exempt
def dataset(request,user_id):
    if request.method == "GET":
        user=get_object_or_404(models.User,id=user_id)
        print(user)
        datasets = models.DatasetBridge.objects.all().values(
            "dataset_id",
            "dataset__name",
            "dataset__description",
            "dataset__visibility",
            "dataset__created_by_id",
            "dataset__created_by_id__name",
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
            user = get_object_or_404(models.User, id=user_id)
            ic(user)
            ic()
            newDataset = models.Dataset(
                name=request.POST.get("name"),
                visibility=request.POST.get("visibility", "private"),
                created_by=user,
                description=request.POST.get("description"),
            )

            newDataset.save()

            newDBBridge = models.DatasetBridge(dataset=newDataset, version=0)
            newDBBridge.save()

            newJoinDSnUSer=models.DatasetUsersBridge(access='read', dataset_bridge=newDBBridge,user=user)
            newJoinDSnUSer.save()
            ic(newDataset)
            ic(f"Saved Dataset, ID:  {newDBBridge.id}")

            return JsonResponse(
                {"result": f"Dataset {newDataset.id} Added Successfully","id":newDataset.id}
            )
        except Exception as e:
            ic(e)
            return HttpResponseBadRequest(e)


@csrf_exempt
def dataset_id(request, id):
    if request.method == "GET":
        user_id = request.GET.get("user_id")
        ic(user_id)  # Debugging: Check user_id

        # Fetch the DatasetBridge instance using the dataset_id
        dataset_bridge = get_object_or_404(models.DatasetBridge, dataset_id=id)
        dataset = dataset_bridge.dataset  # Access the related Dataset object
        ic(dataset)  # Debugging: Check dataset

        # Check if user has access to the dataset
        if user_id:
            bridge_user = models.DatasetUsersBridge.objects.filter(
                dataset_bridge=dataset_bridge, user_id=user_id
            ).first()
            ic(bridge_user)  # Debugging: Check bridge_user
            if not bridge_user:
                return JsonResponse({"error": "Access Denied"}, status=403)

        # Fetch snapshots related to the dataset
        snapshots = []
        for snapshot in models.DatasetSnapshotBridge.objects.filter(
            dataset_bridge=dataset_bridge
        ).values("snapshot_id"):
            snapshot_obj = models.Snapshot.objects.get(id=snapshot["snapshot_id"])
            snapshots.append(
                {
                    "id": snapshot_obj.id,
                    "src": f"/v1/bucket/{snapshot_obj.media.id}",
                    "created_on": snapshot_obj.created_on,
                    "version": snapshot_obj.version,
                }
            )

        # Fetch related reports for the dataset
        reports = models.Report.objects.filter(dataset=dataset)
        reports_data = [
            {
                "report_id": report.id,
                "status": report.status,
                "created_at": report.created_at,
                "user": {
                    "id": report.user.id,
                    "name": report.user.name,
                },
                "results_count": report.results.count(),  # Number of snapshots in the report
            }
            for report in reports
        ]

        # Return the dataset info along with related reports and snapshots
        return JsonResponse(
            {
                "name": dataset.name,
                "description": dataset.description,
                "created_at": dataset.created_at,
                "snapshots": snapshots,
                "reports": reports_data,  # Include the reports in the response
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
def delete_snapshot(request, id):
        if request.method == "DELETE":
            try:
                snapshot = get_object_or_404(models.Snapshot, id=id)
                snapshot.delete()
                return JsonResponse({"status": "success", "message": "Snapshot deleted successfully"}, status=200)
            except Exception as e:
                logging.error(f"An error occurred while deleting the snapshot: {e}")
                return JsonResponse({"status": "error", "message": "An error occurred while deleting the snapshot"}, status=500)
        return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)


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
    ic(id)
    bucket_file = get_object_or_404(models.Bucket, id=id)
    ic(bucket_file)
    if request.method == "DELETE":
        bucket_file.delete()
        return JsonResponse({"message": f"Successfully Deleted {id}"}, safe=False)

    if request.method == "GET":
        try:
            max_size = int(request.GET.get("size", 2000))
            quality = int(request.GET.get("quality", 100))
            mime_type, _ = mimetypes.guess_type(bucket_file.file.url)
            ic(request.method)
            ic(request.GET)
            ic(bucket_file)
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

        alert_frontend("Starting image processing...", 5)

        img = convert_image_to_opencv(image)
        response = {
            "preprocessing": {},
            "feature_extraction": {},
            "generated_images": {},
        }
        ic(response)
        step_paths = []  # Store paths to images and captions for the PDF

        time.sleep(1)
        alert_frontend("Denoising image...", 20)
        time.sleep(1)

        denoised, denoised_path = denoise_image(img)
        step_paths.append(("Denoised Image", denoised_path))
        ic(denoised,denoised_path)
        deconvolved, deconvolved_path = deconvolve_image(denoised)
        step_paths.append(("Deconvolved Image", deconvolved_path))

        alert_frontend("Applying deconvolution...", 40)
        time.sleep(1)

        ic(deconvolved, deconvolved_path)
        bilateral, bilateral_path = apply_bilateral_filter(deconvolved)
        step_paths.append(("Bilateral Filtered Image", bilateral_path))

        alert_frontend("Applying filters...", 60)
        time.sleep(1)

        ic(bilateral, bilateral_path)
        inpainted, inpainted_2 = (img, img)
        inpainted_path = "temp_gaussian_filtered.jpg"
        cv2.imwrite(inpainted_path, (inpainted_2 * 255).astype(np.uint8))
        step_paths.append(("Inpainted Image", inpainted_path))

        ic(inpainted, inpainted_path)
        # Additional filtering using skimage

        gaussian_filtered = gaussian(inpainted, sigma=1)
        gaussian_filtered_path = "temp_gaussian_filtered.jpg"
        cv2.imwrite(gaussian_filtered_path, (gaussian_filtered * 255).astype(np.uint8))
        step_paths.append(("Gaussian Filtered Image", gaussian_filtered_path))

        ic(gaussian_filtered, gaussian_filtered_path)

        sobel_filtered = sobel(cv2.cvtColor(inpainted, cv2.COLOR_BGR2GRAY))
        sobel_filtered_path = "temp_sobel_filtered.jpg"
        cv2.imwrite(sobel_filtered_path, (sobel_filtered * 255).astype(np.uint8))
        step_paths.append(("Sobel Filtered Image", sobel_filtered_path))

        ic(sobel_filtered, sobel_filtered_path)

        wavelet_denoised = denoise_wavelet(inpainted)
        wavelet_denoised_path = "temp_wavelet_denoised.jpg"
        cv2.imwrite(wavelet_denoised_path, (wavelet_denoised * 255).astype(np.uint8))
        step_paths.append(("Wavelet Denoised Image", wavelet_denoised_path))

        ic(wavelet_denoised, wavelet_denoised_path)

        laplace, thresh, thresh_path = extract_features(inpainted)
        step_paths.append(("Threshold Image", thresh_path))

        ic(laplace, thresh, thresh_path)

        # response["feature_extraction"].update(
        #     {
        #         "blur_score": float(laplace),
        #         "otsu_threshold": float(thresh.mean()),
        #     }
        # )

        alert_frontend("Generating report...", 80)
        time.sleep(1)

        if operations.get("report_format") == "PDF":
            response["pdf"] = generate_pdf_report(step_paths)

        ic(response)

        alert_frontend("Process complete!", 100)

        return JsonResponse(response)

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return JsonResponse({"error": "An error occurred"}, status=500)




def inpaint_image(bilateral, img):
    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    if np.any(mask):
        inpainted = inpaint.inpaint_biharmonic(bilateral, mask)
    else:
        inpainted = bilateral
    inpainted_path = "temp_inpainted.jpg"
    cv2.imwrite(inpainted_path, inpainted)
    return inpainted, inpainted_path




@csrf_exempt
def AnalyzeDataset(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            dataset_id = data.get("dataset_id")
            user_id = data.get("user_id")

            if not dataset_id or not user_id:
                return JsonResponse({"error": "dataset_id and user_id are required"}, status=400)

            # Fetch the dataset and user objects
            dataset = models.Dataset.objects.get(id=dataset_id)
            user = models.User.objects.get(id=user_id)

            # Create a new report with a 'pending' status
            report = models.Report.objects.create(
                dataset=dataset,
                user=user,
                status="pending"
            )

            # Start the background analysis task
            threading.Thread(target=analyze_dataset_background, args=(dataset_id, user_id, report.id)).start()

            return JsonResponse({"status": "processing_started", "report_id": report.id}, status=202)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            logging.error(f"Error starting analysis: {e}")
            return JsonResponse({"error": "Internal Server Error"}, status=500)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)




def report_detail_view(request, report_id):
    """
    View to get the details of a specific report.

    Args:
        request: The HTTP request object.
        report_id (uuid): The UUID of the report to retrieve.

    Returns:
        JsonResponse: A JSON response containing the report details or an error message.
    """
    # Use get_object_or_404 to retrieve the report or return a 404 error
    report = get_object_or_404(models.Report, id=report_id)

    # Prepare the data to be returned in the JSON response
    report_data = {
        'id': report.id,
        'dataset_name': report.dataset.name, # Accessing related Dataset name
        'user_name': report.user.name,       # Accessing related User name
        'report_file_url': request.build_absolute_uri(report.report_file.url) if report.report_file else None, # Get absolute URL for the file
        'created_at': report.created_at.isoformat(), # Format datetime as ISO string
        'status': report.status,
        'snapshots': [], # List to hold details of associated snapshots
    }

    # Add details for associated snapshots
    for snapshot in report.results.all():
        snapshot_data = {
            'id': snapshot.id,
            'media_name': snapshot.media.name, # Accessing related Bucket name
            'location_title': snapshot.location.title, # Accessing related Location title
            'created_on': snapshot.created_on.isoformat(), # Format datetime as ISO string
            'version': snapshot.version,
            'created_by_name': snapshot.created_by.name, # Accessing related User name
            'src':'/v1/bucket/'+str(snapshot.media.id)
        }
        report_data['snapshots'].append(snapshot_data)

    # Return the data as a JSON response
    return JsonResponse(report_data)


def save_snapshot_to_report(img_arr, report, user) -> None:
    from django.core.files.base import ContentFile
    import uuid
    import cv2

    success, buffer = cv2.imencode('.jpg', (img_arr * 255).astype(np.uint8))
    if not success:
        raise Exception("Failed to encode image.")

    image_file = ContentFile(buffer.tobytes(), name=f"{uuid.uuid4()}.jpg")

    bucket = models.Bucket.objects.create(
        file=image_file,
        name=image_file.name,
        created_by=user
    )

    snapshot = models.Snapshot.objects.create(
        media=bucket,
        location=models.Location.objects.create(),  # or pass location if you have
        created_by=user
    )

    report.results.add(snapshot)


def analyze_image(media_file, report_id) -> dict:
    try:
        ic(media_file.name)

        img = convert_image_to_opencv(media_file)


        report = models.Report.objects.get(id=report_id)
        user = report.user

        denoised, _ = denoise_image(img)
        save_snapshot_to_report(denoised, report, user)

        deconvolved, _ = deconvolve_image(denoised)
        save_snapshot_to_report(deconvolved, report, user)

        bilateral, _ = apply_bilateral_filter(deconvolved)
        save_snapshot_to_report(bilateral, report, user)

        inpainted, _ = (img, img)
        save_snapshot_to_report(inpainted, report, user)

        gaussian_filtered = gaussian(inpainted, sigma=1)
        save_snapshot_to_report(gaussian_filtered, report, user)

        sobel_filtered = sobel(cv2.cvtColor(inpainted, cv2.COLOR_BGR2GRAY))
        save_snapshot_to_report(sobel_filtered, report, user)

        wavelet_denoised = denoise_wavelet(inpainted)
        save_snapshot_to_report(wavelet_denoised, report, user)

        _, _, thresh = extract_features(inpainted)
        save_snapshot_to_report(thresh, report, user)

        report.status = "completed"
        report.save()

        return {
            "status": "success",
            "images_count": 8,
        }
    except Exception as e:
        logging.error(f"Error processing image: {e}")
        return {
            "status": "error",
            "details": str(e),
        }




def analyze_dataset_background(dataset_id, user_id, report_id):
    alert_frontend("Analysis Started, Refreshing", progress=0,type="REFRESH")

    try:
        dataset_bridge = models.DatasetBridge.objects.get(dataset_id=dataset_id)
        user = models.User.objects.get(id=user_id)

        # Fetch the report or create a new one if not found
        report = models.Report.objects.get(id=report_id)

        # Ensure the report belongs to the same dataset and user
        if report.dataset != dataset_bridge.dataset or report.user.id != user.id:
            raise ValueError("Report does not belong to this dataset or user")

        dataset_snapshots = models.DatasetSnapshotBridge.objects.filter(
            dataset_bridge=dataset_bridge
        ).select_related('snapshot__media')

        total_snapshots = len(dataset_snapshots)
        processed_snapshots = 0

        for ds_bridge in dataset_snapshots:
            snapshot = ds_bridge.snapshot
            media_file = snapshot.media.file

            # Assuming analyze_image() has some stages or steps you can break down
            alert_frontend(f"Starting analysis of image: {media_file.name}", progress=int(processed_snapshots / total_snapshots * 100))

            # Perform image analysis
            result = analyze_image(media_file,report_id)
            processed_snapshots += 1

            # Associate the result (snapshot) with the report
            report.results.add(snapshot)  # Add the snapshot to the report's results

            # Update progress after analysis step
            alert_frontend(f"Analyzing image: {media_file.name}", progress=int(processed_snapshots / total_snapshots * 100))

            # Complete progress after finishing all images
            if processed_snapshots == total_snapshots:
                alert_frontend("Completed analysis for all images in dataset.", progress=100)

            # Do whatever you want with the result (save it? log it? update DB?)
            print(f"Snapshot {snapshot.id} analysis result: {result}")

        # Once all images are analyzed, mark the report as completed
        report.status = 'completed'
        report.save()

    except Exception as e:
        logging.error(f"Background dataset analysis failed: {e}")
        if 'report' in locals():  # If the report was created, mark it as failed
            report.status = 'failed'
            report.save()
