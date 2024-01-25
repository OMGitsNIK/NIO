# import cv2 as cv
# import numpy as np


# # img = cv.imread('img.jpg')
# # gray_image = cv.cvtColor(img, cv.COLOR_BGR2GRAY) 

# # assert gray_image is not None, "file could not be read, check with os.path.exists()"
# # equ = cv.equalizeHist(gray_image)

# # gray_image = cv.cvtColor(gray_image, cv.COLOR_GRAY2RGB) 
# # equ = cv.cvtColor(equ, cv.COLOR_GRAY2RGB) 
# # res = np.hstack([img,gray_image,equ]) #stacking images side-by-side
# # cv.imwrite('res.png',res)


# img = cv.imread('img.jpg')
# gray_image = cv.cvtColor(img, cv.COLOR_BGR2GRAY) 

# assert gray_image is not None, "file could not be read, check with os.path.exists()"
# # create a CLAHE object (Arguments are optional).
# clahe = cv.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
# cl1 = clahe.apply(gray_image)


# equ = cv.equalizeHist(gray_image)
# equ = cv.cvtColor(equ, cv.COLOR_GRAY2RGB) 
# cl1 = cv.cvtColor(cl1, cv.COLOR_GRAY2RGB) 
# gray_image = cv.cvtColor(gray_image, cv.COLOR_GRAY2RGB) 


# res = np.hstack([img,gray_image,equ,cl1]) #stacking images side-by-side
# cv.imwrite('clahe_2.jpg',res)


# import numpy as np
# import cv2 as cv
# from matplotlib import pyplot as plt
# img = cv.imread('img.jpg')
# assert img is not None, "file could not be read, check with os.path.exists()"
# gray = cv.cvtColor(img,cv.COLOR_BGR2GRAY)
# ret, thresh = cv.threshold(gray,0,255,cv.THRESH_BINARY_INV+cv.THRESH_OTSU)

# cv.imwrite('ret.jpg',ret)
# cv.imwrite('thresh.jpg',thresh)


import numpy as np
import cv2

img = cv2.imread('img.jpg', cv2.IMREAD_GRAYSCALE)
assert img is not None, "File could not be read, check if the file exists."

equ = cv2.equalizeHist(img)
res = np.hstack((img, equ))  # Stacking images side-by-side
cv2.imwrite('res3.png',res)