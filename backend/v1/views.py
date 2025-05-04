import logging
import threading
from .lib.cv import apply_bilateral_filter, convert_image_to_opencv, deconvolve_image, denoise_image, extract_features, load_yolo_classification_model, load_yolo_segmentation_model, run_yolo_classification, run_yolo_segmentation
from .lib.report_gen import generate_pdf_report
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
import mimetypes
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from icecream import ic
from PIL import Image
from django.core.files.base import ContentFile
import uuid
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
from io import BytesIO

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
            time.sleep(1)

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")

def alert_frontend(message: str, progress: int, type=''):
    sse_clients.append({"message": message, "progress": progress,"type":type})

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

@csrf_exempt
def dataset(request,user_id):
    if request.method == "GET":
        user = get_object_or_404(models.User, id=user_id)

        datasets = models.DatasetBridge.objects.filter(
            dataset__created_by=user
        ).values(
            "dataset_id",
            "dataset__name",
            "dataset__description",
            "dataset__visibility",
            "dataset__created_by_id",
            "dataset__created_by__name",
            "dataset__created_at",
        )

        dataset_list = []
        for dataset in datasets:
            snapshots = models.Snapshot.objects.filter(
                id__in=models.DatasetSnapshotBridge.objects.filter(
                    dataset_bridge__dataset_id=dataset["dataset_id"]
                ).values_list("snapshot_id", flat=True),
                created_by=user
            ).values(
                "id", "media__file", "location", "created_on", "version", "media__id"
            )

            for snapshot in snapshots:
                snapshot["src"] = f"/v1/bucket/{snapshot['media__id']}"

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
        ic(user_id)

        dataset_bridge = get_object_or_404(models.DatasetBridge, dataset_id=id)
        dataset = dataset_bridge.dataset
        ic(dataset)

        if user_id:
            bridge_user = models.DatasetUsersBridge.objects.filter(
                dataset_bridge=dataset_bridge, user_id=user_id
            ).first()
            ic(bridge_user)
            if not bridge_user:
                return JsonResponse({"error": "Access Denied"}, status=403)

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
                "results_count": report.results.count(),
            }
            for report in reports
        ]

        return JsonResponse(
            {
                "name": dataset.name,
                "description": dataset.description,
                "created_at": dataset.created_at,
                "snapshots": snapshots,
                "reports": reports_data,
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
            max_size = int(request.GET.get("size", 720))
            quality = int(request.GET.get("quality", 50))
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

                if bucket_file_actual_image.mode == "RGBA":
                    bucket_file_actual_image = bucket_file_actual_image.convert("RGB")

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
        step_paths = []

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

            dataset = models.Dataset.objects.get(id=dataset_id)
            user = models.User.objects.get(id=user_id)

            report = models.Report.objects.create(
                dataset=dataset,
                user=user,
                status="pending"
            )

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
    report = get_object_or_404(models.Report, id=report_id)

    report_data = {
        'id': report.id,
        'dataset_name': report.dataset.name,
        'user_name': report.user.name,
        'report_file_url': request.build_absolute_uri(report.report_file.url) if report.report_file else None,
        'created_at': report.created_at.isoformat(),
        'status': report.status,
        'snapshots': [],
    }

    for snapshot in report.results.all():
        snapshot_data = {
            'id': snapshot.id,
            'media_name': snapshot.media.name,
            'location_title': snapshot.location.title,
            'created_on': snapshot.created_on.isoformat(),
            'version': snapshot.version,
            'created_by_name': snapshot.created_by.name,
            'src':'/v1/bucket/'+str(snapshot.media.id)
        }
        report_data['snapshots'].append(snapshot_data)

    return JsonResponse(report_data)

def save_snapshot_to_report(img_arr, report, user, name=None) -> None:
    cv2.imwrite('buffer1.jpg', img_arr)
    img = Image.fromarray(img_arr)

    buffer = BytesIO()
    img.save(buffer, format="JPEG")
    img.save('buffer.jpg', format="JPEG")
    image_file = ContentFile(buffer.getvalue(), name=f"{uuid.uuid4()}.jpg")

    bucket = models.Bucket.objects.create(
        file=image_file,
        name=image_file.name if name is None else name,
        created_by=user
    )

    snapshot = models.Snapshot.objects.create(
        media=bucket,
        location=models.Location.objects.create(),
        created_by=user
    )

    report.results.add(snapshot)


def analyze_image(media_file, report_id) -> dict:
    try:
        ic(media_file.name)

        img = convert_image_to_opencv(media_file)
        report = models.Report.objects.get(id=report_id)
        user = report.user
        save_snapshot_to_report(img, report, user,'og')

        denoised= denoise_image(img)
        save_snapshot_to_report(denoised, report, user,'denoised')

        # deconvolved= deconvolve_image(denoised)
        # save_snapshot_to_report(deconvolved, report, user,'deconvolved')

        # bilateral= apply_bilateral_filter(deconvolved)
        # save_snapshot_to_report(bilateral, report, user,'inpainted')

        # inpainted= bilateral
        # save_snapshot_to_report(inpainted, report, user,'inpainted')

        # wavelet_denoised = denoise_image(inpainted)
        # save_snapshot_to_report(wavelet_denoised, report, user,'wavelet')

        # seg_model = load_yolo_segmentation_model('public/best_seg.pt')
        # cls_model = load_yolo_classification_model('public/best_cls.pt')

        # if seg_model:
        #     ic("Running YOLO Segmentation...")
        #     segmentation_results = run_yolo_segmentation(wavelet_denoised, seg_model)
        #     if segmentation_results:
        #         segmentation_image, segmentation_summary = segmentation_results
        #         ic("YOLO Segmentation Results:")
        #         ic(segmentation_image)

        #         ic("Saving segmentation snapshot to report...")
        #         try:
        #             save_snapshot_to_report(segmentation_image[0], report, user,'segment')
        #             ic("Segmentation snapshot saved successfully.")
        #         except Exception as e:
        #             ic(f"Failed to save segmentation snapshot to report: {e}")

        #     else:
        #         ic("YOLO Segmentation failed or did not return results.")

        # if cls_model:
        #     ic("Running YOLO Classification...")
        #     classification_results = run_yolo_classification(wavelet_denoised, cls_model)
        #     ic(classification_results)
        #     if classification_results:
        #         classification_image, classification_summary = classification_results
        #         ic("YOLO Classification Results:")
        #         ic(classification_summary)
        #         ic("Saving classification snapshot to report...")
        #         try:
        #             save_snapshot_to_report(classification_image[0], report, user,'clsasify')
        #             ic("Classification snapshot saved successfully.")
        #         except Exception as e:
        #             ic(f"Failed to save classification snapshot to report: {e}")

        # else:
        #     ic("YOLO Classification failed or did not return results.")

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

        report = models.Report.objects.get(id=report_id)

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

            alert_frontend(f"Starting analysis of image: {media_file.name}", progress=int(processed_snapshots / total_snapshots * 100))

            result = analyze_image(media_file,report_id)
            processed_snapshots += 1

            # report.results.add(snapshot)

            alert_frontend(f"Analyzing image: {media_file.name}", progress=int(processed_snapshots / total_snapshots * 100))

            if processed_snapshots == total_snapshots:
                alert_frontend("Completed analysis for all images in dataset.", progress=100)

        report.status = 'completed'
        report.save()

    except Exception as e:
        logging.error(f"Background dataset analysis failed: {e}")
        if 'report' in locals():
            report.status = 'failed'
            report.save()
