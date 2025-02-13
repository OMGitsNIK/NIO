import cv2
import numpy as np
from skimage.restoration import inpaint
import pywt



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
