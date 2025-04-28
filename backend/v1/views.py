import logging
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

def alert_frontend(message: str, progress: int):
    sse_clients.append({"message": message, "progress": progress})
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
        ic(user_id)
        dataset = get_object_or_404(models.DatasetBridge, dataset_id=id)
        ic(dataset)
        if user_id:
            bridge_user = models.DatasetUsersBridge.objects.filter(
                dataset_bridge=dataset, user_id=user_id
            ).first()
            ic(bridge_user)
            if not bridge_user:
                return JsonResponse({"error": "Access Denied"}, status=403)

        snapshots = []
        for snapshot in models.DatasetSnapshotBridge.objects.filter(
            dataset_bridge=dataset
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
    """
    Analyzes a dataset by executing a specified pipeline of operations on each image.
    Notifies the frontend about the progress and results via SSE.
    """
    if request.method == "POST":
        try:
            # Extract dataset ID and pipeline ID from the request body
            data = json.loads(request.body)
            dataset_id = data.get("dataset_id")
            pipeline_id = data.get("pipeline_id")
            user_id = data.get("user_id") # Assuming user_id is also sent

            if not dataset_id or not pipeline_id or not user_id:
                 return JsonResponse({"error": "dataset_id, pipeline_id, and user_id are required"}, status=400)

            # Simulate adding to a queue and starting the process
            alert_frontend(f"Starting analysis for dataset {dataset_id} using pipeline {pipeline_id}...", 5)

            # Get the dataset bridge and pipeline
            dataset_bridge = get_object_or_404(models.DatasetBridge, dataset_id=dataset_id)
            pipeline = get_object_or_404(models.Pipeline, id=pipeline_id)
            user = get_object_or_404(models.User, id=user_id)


            # Get ordered operations associated with the pipeline
            pipeline_operations = models.PipelineOperationBridge.objects.filter(
                pipeline=pipeline
            ).order_by('operation__order').select_related('operation') # Order by operation order

            if not pipeline_operations.exists():
                 alert_frontend(f"Pipeline {pipeline_id} has no operations defined.", 100)
                 return JsonResponse({"message": f"Pipeline {pipeline_id} has no operations defined."}, status=200)


            # Get all snapshots associated with the dataset
            dataset_snapshots = models.DatasetSnapshotBridge.objects.filter(
                dataset_bridge=dataset_bridge
            ).select_related('snapshot__media') # Optimize query

            total_snapshots = dataset_snapshots.count()
            if total_snapshots == 0:
                 alert_frontend("No snapshots found in the dataset.", 100)
                 return JsonResponse({"message": "No snapshots found in the dataset."}, status=200)

            total_operations = total_snapshots * pipeline_operations.count()
            current_operation_count = 0
            analysis_results = []

            # Iterate through snapshots and execute pipeline operations
            for i, ds_bridge in enumerate(dataset_snapshots):
                snapshot = ds_bridge.snapshot
                media_file = snapshot.media.file

                try:
                    # Open the image using PIL and convert to OpenCV format
                    pil_image = Image.open(media_file)
                    # Ensure image is in a format OpenCV can handle (e.g., BGR)
                    if pil_image.mode == 'RGBA':
                        pil_image = pil_image.convert('RGB')
                    opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

                    snapshot_results = {
                        "snapshot_id": str(snapshot.id),
                        "media_name": snapshot.media.name,
                        "operations": []
                    }

                    # Execute each operation in the pipeline for the current snapshot
                    for j, po_bridge in enumerate(pipeline_operations):
                        pipeline_operation = po_bridge.operation
                        current_operation_count += 1

                        # Simulate creating a new Operation instance for this specific snapshot execution
                        new_operation = models.Operation(
                            type=pipeline_operation.type,
                            status='running', # Set status to running
                            order=pipeline_operation.order,
                            transferred_attributes=pipeline_operation.transferred_attributes,
                            # reference will be set after creating Estimate/Filter
                        )

                        # Simulate creating related Estimate or Filter based on operation type
                        if pipeline_operation.type == 'estimate':
                            # Simulate creating an Estimate
                            new_estimate = models.Estimate(
                                name=f"Estimate for {snapshot.media.name} - {pipeline_operation.id}",
                                parameters=pipeline_operation.transferred_attributes, # Use transferred_attributes as parameters
                                output={} # Initialize output
                            )
                            new_estimate.save()
                            new_operation.reference = new_estimate.id
                            new_operation.save()

                            # Simulate performing the estimate (e.g., calculate average intensity)
                            # In a real scenario, this would involve calling the actual estimation logic
                            estimated_value = np.mean(opencv_image) # Simple example: average intensity
                            new_estimate.output = {"average_intensity": float(estimated_value)}
                            new_estimate.save()

                            # Update operation status
                            new_operation.status = 'complete'
                            new_operation.save()

                            snapshot_results["operations"].append({
                                "operation_id": str(new_operation.id),
                                "type": new_operation.type,
                                "status": new_operation.status,
                                "estimate_id": str(new_estimate.id),
                                "output": new_estimate.output
                            })

                        elif pipeline_operation.type == 'filter':
                            # Simulate creating a Filter (requires a Bucket output)
                            # This is a placeholder; a real filter would produce an image and save it to a Bucket
                            alert_frontend(f"Warning: Filter operation simulation is a placeholder.", -1) # Use -1 for warnings

                            # Simulate creating a placeholder Bucket output
                            placeholder_bucket = models.Bucket(
                                name=f"Filtered_{snapshot.media.name}_{pipeline_operation.id}",
                                created_by=user,
                                # file field would be set here in a real implementation
                            )
                            placeholder_bucket.save()

                            new_filter = models.Filter(
                                name=f"Filter for {snapshot.media.name} - {pipeline_operation.id}",
                                parameters=pipeline_operation.transferred_attributes,
                                output=placeholder_bucket # Link to the placeholder bucket
                            )
                            new_filter.save()
                            new_operation.reference = new_filter.id
                            new_operation.save()

                            # Simulate filter execution (no actual image processing here)
                            new_operation.status = 'complete' # Simulate completion
                            new_operation.save()

                            snapshot_results["operations"].append({
                                "operation_id": str(new_operation.id),
                                "type": new_operation.type,
                                "status": new_operation.status,
                                "filter_id": str(new_filter.id),
                                # No output field for filter in results, output is in the Bucket
                            })


                        # Link the snapshot to the newly created operation
                        models.SnapshotOperationBridge.objects.create(
                            snapshot=snapshot,
                            operation=new_operation
                        )

                        # Update frontend with progress after each operation
                        progress_per_operation = 90 / total_operations if total_operations > 0 else 90
                        current_progress = 5 + int(current_operation_count * progress_per_operation)
                        alert_frontend(f"Processing snapshot {i + 1}/{total_snapshots}, operation {j + 1}/{pipeline_operations.count()}...", current_progress)
                        time.sleep(0.1) # Small delay to simulate work

                    analysis_results.append(snapshot_results)

                except Exception as img_e:
                    logging.error(f"Error processing image {snapshot.media.name}: {img_e}")
                    snapshot_results = {
                        "snapshot_id": str(snapshot.id),
                        "media_name": snapshot.media.name,
                        "error": f"Failed to process image: {img_e}"
                    }
                    analysis_results.append(snapshot_results)
                    # Continue processing other images

            # Analysis complete
            alert_frontend("Dataset analysis complete.", 100)

            return JsonResponse({"status": "success", "results": analysis_results}, status=200)

        except models.DatasetBridge.DoesNotExist:
             alert_frontend(f"Dataset with ID {dataset_id} not found.", 100)
             return JsonResponse({"error": f"Dataset with ID {dataset_id} not found"}, status=404)
        except models.Pipeline.DoesNotExist:
             alert_frontend(f"Pipeline with ID {pipeline_id} not found.", 100)
             return JsonResponse({"error": f"Pipeline with ID {pipeline_id} not found"}, status=404)
        except models.User.DoesNotExist:
             alert_frontend(f"User with ID {user_id} not found.", 100)
             return JsonResponse({"error": f"User with ID {user_id} not found"}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON in request body"}, status=400)
        except Exception as e:
            logging.error(f"An error occurred during dataset analysis: {e}")
            alert_frontend("An error occurred during analysis.", 100)
            return JsonResponse({"error": "An error occurred during dataset analysis"}, status=500)

    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)
