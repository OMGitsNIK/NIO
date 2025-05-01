import cv2
import numpy as np
import json
from skimage.restoration import inpaint, unsupervised_wiener
from skimage.util import img_as_float
from skimage.color import rgb2gray, gray2rgb, rgb2lab, lab2rgb
from skimage.filters import gaussian, sobel
from skimage.restoration import denoise_wavelet
from sklearn.metrics.pairwise import cosine_similarity
import uuid
from ultralytics import YOLO
from typing import Any, List, Dict, Optional, Union
import pywt

def convert_image_to_opencv(image):
    image_bytes = image.read()
    nparr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

def convert_bytes_to_opencv_image(image_bytes: bytes) -> Optional[np.ndarray]:
    """Converts raw image bytes to an OpenCV image (NumPy array)."""
    if not isinstance(image_bytes, bytes) or not image_bytes:
        print("Invalid input: image_bytes must be non-empty bytes.")
        return None
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            print("Failed to decode image bytes.")
        return img
    except Exception as e:
        print(f"Error decoding image bytes: {e}")
        return None


def denoise_image(img_arr: np.ndarray) -> Optional[np.ndarray]:
    """Applies non-local means denoising to an image."""
    if img_arr is None: return None
    try:
        if len(img_arr.shape) == 3:
            denoised = cv2.fastNlMeansDenoisingColored(img_arr, None, 10, 10, 7, 21)
        elif len(img_arr.shape) == 2:
            denoised = cv2.fastNlMeansDenoising(img_arr, None, 10, 7, 21)
        else:
            print(f"Unsupported image shape for denoising: {img_arr.shape}")
            return img_arr
        return denoised
    except Exception as e:
        print(f"Denoising failed: {e}")
        return img_arr

def deconvolve_image(img_arr: np.ndarray) -> Optional[np.ndarray]:
    """Applies deconvolution (deblurring) using Unsupervised Wiener filter on L channel."""
    if img_arr is None: return None
    try:
        img_float = img_as_float(img_arr)
        lab_img = rgb2lab(img_float)
        L_channel = lab_img[:, :, 0]
        psf = np.ones((5, 5)) / 25
        deconvolved_L, _ = unsupervised_wiener(L_channel, psf, iterations=5, is_blind=True)
        deconvolved_L = np.clip(deconvolved_L, 0, 100)
        lab_img[:, :, 0] = deconvolved_L
        rgb_deconvolved_float = lab2rgb(lab_img)
        img_deconvolved = (rgb_deconvolved_float * 255).astype(np.uint8)
        img_deconvolved_bgr = cv2.cvtColor(img_deconvolved, cv2.COLOR_RGB2BGR)
        return img_deconvolved_bgr
    except Exception as e:
        print(f"Deblurring (Deconvolution) failed: {e}")
        return img_arr

def apply_bilateral_filter(deconvolved):
    bilateral = cv2.bilateralFilter(deconvolved, 9, 75, 75)
    bilateral_path = "temp_bilateral.jpg"
    cv2.imwrite(bilateral_path, bilateral)
    return bilateral

def apply_inpainting(img_arr: np.ndarray, mask_arr: Optional[np.ndarray] = None) -> Optional[np.ndarray]:
    """
    Applies inpainting to an image based on a mask.
    If no mask is provided or mask is empty, returns the original image.
    *** Requires a mask (np.ndarray) to be generated externally. ***
    """
    if img_arr is None: return None
    if mask_arr is not None:
        if mask_arr.dtype != np.uint8:
            mask_arr = mask_arr.astype(np.uint8)
        if mask_arr.ndim == 3:
            mask_arr = cv2.cvtColor(mask_arr, cv2.COLOR_BGR2GRAY)
        if mask_arr.shape[:2] != img_arr.shape[:2]:
            print(f"Warning: Mask shape {mask_arr.shape[:2]} does not match image shape {img_arr.shape[:2]}. Inpainting skipped.")
            mask_arr = None
    if mask_arr is not None and np.any(mask_arr > 0):
        try:
            if img_arr.dtype != np.uint8:
                img_arr = (img_arr * 255).astype(np.uint8)
            inpainted = cv2.inpaint(img_arr, mask_arr, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
            return inpainted
        except Exception as e:
            print(f"Inpainting failed: {e}")
            return img_arr
    else:
        return img_arr

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

def calculate_blur(img_arr: np.ndarray) -> float:
    """Calculates a blur metric using Laplace variance."""
    if img_arr is None: return 0.0
    try:
        gray = cv2.cvtColor(img_arr, cv2.COLOR_BGR2GRAY) if len(img_arr.shape) == 3 else img_arr
        gray_float = img_as_float(gray)
        laplace_var = cv2.Laplacian(gray_float, cv2.CV_64F).var()
        return laplace_var
    except Exception as e:
        print(f"Blur calculation failed: {e}")
        return 0.0

def calculate_contrast(img_arr: np.ndarray) -> float:
    """Calculates a contrast metric (standard deviation of L channel)."""
    if img_arr is None: return 0.0
    try:
        lab_img = rgb2lab(img_as_float(img_arr))
        L_channel = lab_img[:, :, 0]
        return float(L_channel.std())
    except Exception as e:
        print(f"Contrast calculation failed: {e}")
        return 0.0

def adjust_contrast(img_arr: np.ndarray) -> Optional[np.ndarray]:
    """Applies color-aware contrast adjustment (histogram equalization on L channel)."""
    if img_arr is None: return None
    try:
        lab = cv2.cvtColor(img_arr, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        l_eq = cv2.equalizeHist(l)
        lab_eq = cv2.merge((l_eq, a, b))
        img_adjusted = cv2.cvtColor(lab_eq, cv2.COLOR_LAB2BGR)
        return img_adjusted
    except Exception as e:
        print(f"Contrast adjustment failed: {e}")
        return img_arr

def extract_feature_vector(img_arr: np.ndarray) -> Optional[np.ndarray]:
    """Extracts a simple feature vector (resized flattened grayscale)."""
    if img_arr is None: return None
    try:
        if len(img_arr.shape) == 3:
            gray = cv2.cvtColor(img_arr, cv2.COLOR_BGR2GRAY)
        else:
            gray = img_arr
        target_size = (64, 64)
        if img_arr.shape[0] < target_size[1] or img_arr.shape[1] < target_size[0]:
            print(f"Image size {img_arr.shape[:2]} too small for feature extraction target {target_size}. Skipping.")
            return None
        feature_vec = cv2.resize(gray, target_size).flatten().astype(np.float32) / 255.0
        return feature_vec
    except Exception as e:
        print(f"Feature extraction failed: {e}")
        return None

def find_similar_images(
    target_img_arr: np.ndarray,
    comparison_images_data: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Finds images in the comparison list similar to the target image.
    Takes a list of dictionaries, each containing 'id' and 'image_arr' (np.ndarray).
    """
    if target_img_arr is None: return []
    target_vec = extract_feature_vector(target_img_arr)
    if target_vec is None:
        print("Skipping similarity: Failed to extract features from target image.")
        return []
    target_vec = target_vec.reshape(1, -1)
    results = []
    for entry in comparison_images_data:
        try:
            comp_id = entry.get('id')
            comp_img_arr = entry.get('image_arr')
            if comp_img_arr is None:
                print(f"Skipping similarity for {comp_id}: Image array is None.")
                continue
            vec = extract_feature_vector(comp_img_arr)
            if vec is None:
                print(f"Skipping similarity for {comp_id}: Feature extraction failed.")
                continue
            vec = vec.reshape(1, -1)
            if target_vec is not None and vec is not None and target_vec.shape == vec.shape:
                score = float(cosine_similarity(target_vec, vec)[0][0])
                results.append({'id': comp_id, 'score': score})
            else:
                print(f"Skipping similarity for {comp_id}: Vector mismatch or None.")
        except Exception as e:
            print(f"Similarity comparison failed for {entry.get('id', 'unknown')}: {e}")
    sorted_results = sorted(results, key=lambda x: -x["score"])
    return sorted_results[:5]

def run_yolo_segmentation(img_arr: np.ndarray, model: Any, save_path: str = None):
    """
    Runs YOLO Segmentation, draws results on the image, saves the image to the specified path, 
    and returns the image along with a summary of detected objects (count and names).

    Args:
        img_arr: Input image as a NumPy array.
        model: Loaded YOLO Segmentation model.
        save_path: Optional path to save the output image.

    Returns:
        A tuple containing:
        - The image (np.ndarray) with segmentation masks and bounding boxes drawn.
        - A string summary of the detected objects (count and names).
    """
    # Ensure img_arr is a NumPy array
    if not isinstance(img_arr, np.ndarray):
        print("Input image is not a valid NumPy array.")
        return None
    
    if model is None:
        print("YOLO Segmentation model is None. Skipping.")
        return None

    try:
        # Run inference
        results = model(img_arr)[0]  # Assuming batch size 1

        # Get image with results drawn
        if hasattr(results, 'plot') and callable(results.plot):
            results_img = results.plot()  # This draws masks, boxes, labels
        else:
            print("YOLO results object lacks .plot() method. Returning original image.")
            results_img = img_arr  # Return original image if plotting not possible

        # Optionally save the image
        if save_path:
            cv2.imwrite(save_path, results_img)
            print(f"Results saved to {save_path}")

        # Process results for text summary (count and what's found)
        summary_text = "No objects detected."
        if hasattr(results, 'boxes') and results.boxes is not None:
            detections = results.boxes
            count = len(detections)
            if count > 0:
                # Get class names for detected objects
                if hasattr(results, 'names') and hasattr(detections, 'cls'):
                    detected_classes = [
                        results.names[int(cls_id)]
                        for cls_id in detections.cls
                        if int(cls_id) < len(results.names)  # Basic check
                    ]
                    # Create a summary string, potentially counting occurrences
                    class_counts = {}
                    for cls_name in detected_classes:
                        class_counts[cls_name] = class_counts.get(cls_name, 0) + 1

                    summary_items = [
                        f"{count} {name}" if count == 1 else f"{count} {name}s"
                        for name, count in class_counts.items()
                    ]
                    summary_text = f"Found {count} object(s): " + ", ".join(summary_items)
                else:
                    summary_text = f"Found {count} object(s). Class names not available."
            else:
                summary_text = "Found 0 objects."
        else:
            summary_text = "No detection boxes found in results."

        return results_img, summary_text

    except Exception as e:
        print(f"YOLO Segmentation failed: {e}")
        return img_arr, f"Error during segmentation: {e}"  # Return original image and error message
def run_yolo_classification(img_arr, model, save_path: str = None):
    """
    Runs YOLO Classification, draws results on the image (if possible), saves the image to the specified path,
    and returns the image along with the top classification result.

    Args:
        img_arr: Input image as a NumPy array.
        model: Loaded YOLO Classification model.
        save_path: Optional path to save the output image.

    Returns:
        A tuple containing:
        - The image (np.ndarray) potentially with classification results drawn.
        - A string summary of the top classification result (class name and confidence).
    """
    # Ensure img_arr is a NumPy array
    if not isinstance(img_arr, np.ndarray):
        print("Input image is not a valid NumPy array.")
        return None
    
    if model is None:
        print("YOLO Classification model is None. Skipping.")
        return None

    try:
        # Run inference
        results = model(img_arr)[0]  # Assuming batch size 1

        # Get image with results drawn (classification plot might just add text)
        if hasattr(results, 'plot') and callable(results.plot):
            results_img = results.plot()  # Assuming it returns the plotted image array
        else:
            print("YOLO results object lacks .plot() method. Returning original image.")
            results_img = img_arr  # Return original image if plotting not possible

        # Optionally save the image
        if save_path:
            cv2.imwrite(save_path, results_img)
            print(f"Results saved to {save_path}")

        # Process results for text summary (top class and confidence)
        summary_text = "Classification failed or no prediction."
        if hasattr(results, 'probs') and results.probs is not None:
            probs = results.probs
            if hasattr(probs, 'top1') and hasattr(probs, 'top1conf') and hasattr(results, 'names'):
                top_prob_idx = probs.top1
                top_confidence = probs.top1conf
                # Ensure index is within bounds of class names
                if top_prob_idx is not None and top_confidence is not None and int(top_prob_idx) < len(results.names):
                    top_class_name = results.names[int(top_prob_idx)]
                    summary_text = f"Top prediction: {top_class_name} ({top_confidence:.2f})"
                else:
                    summary_text = "Could not get top prediction details from results."
            else:
                summary_text = "Classification probabilities object lacks required attributes (top1, top1conf, names)."
        else:
            summary_text = "No classification probabilities found in results."

        return results_img, summary_text

    except Exception as e:
        print(f"YOLO Classification failed: {e}")
        return img_arr, f"Error during classification: {e}"  # Return original image and error message


def load_yolo_segmentation_model(model_path: str = "yolov8n-seg.pt") -> Any:
    """Loads your custom YOLO Segmentation model."""
    try:
        model = YOLO(model_path)
        print(f"YOLO Segmentation model loaded from {model_path}")
        return model
    except Exception as e:
        print(f"Segmentation model load failed from {model_path}: {e}")
        return None

def load_yolo_classification_model(model_path: str = "yolov8n-cls.pt") -> Any:
    """Loads your custom YOLO Classification model."""
    try:
        model = YOLO(model_path)
        print(f"YOLO Classification model loaded from {model_path}")
        return model
    except Exception as e:
        print(f"Classification model load failed from {model_path}: {e}")
        return None

def generate_bright_mask(img_arr: np.ndarray, threshold: int = 250) -> Optional[np.ndarray]:
    """Generates a mask for pixels above a certain brightness threshold."""
    if img_arr is None: return None
    try:
        if img_arr.dtype != np.uint8:
            img_arr = (img_arr * 255).astype(np.uint8)
        gray = cv2.cvtColor(img_arr, cv2.COLOR_BGR2GRAY) if img_arr.ndim == 3 else img_arr
        _, mask = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)
        return mask
    except Exception as e:
        print(f"Mask generation failed: {e}")
        return None
