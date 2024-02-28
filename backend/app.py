# import cv2 as cv
# import numpy as np


# img = cv.imread('img.jpg')
# gray_image = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

# assert gray_image is not None, "file could not be read, check with os.path.exists()"
# equ = cv.equalizeHist(gray_image)

# gray_image = cv.cvtColor(gray_image, cv.COLOR_GRAY2RGB)
# equ = cv.cvtColor(equ, cv.COLOR_GRAY2RGB)
# res = np.hstack([img,gray_image,equ]) #stacking images side-by-side
# cv.imwrite('res.png',res)

from PIL import Image
import cv2
from skimage import filters, exposure
from flask import Flask, jsonify, send_file, request
import os
from flask_cors import CORS

import uuid
import numpy as np
import matplotlib
app = Flask(__name__)
cors = CORS(app)
UPLOAD_FOLDER = "Uploads"
TEMP_DATABASE = [
    {
    "Name": "Azure Vase Sponge",
    "Image": "Azure Vase Sponge.jpg",
    "Type": "Callyspongia Plicifera",
    "Habitat": "Coral reefs",
    "Color": "Blue",
    "Size": "Up to 60 cm",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters",
    "Description": "The Azure Vase Sponge is a brightly colored sponge that is found in coral reefs in the Caribbean Sea. It is named for its vase-like shape and its blue color. This sponge can grow up to 60 cm tall and is an important part of the coral reef ecosystem."
  },
  {
    "Name": "Black-Ball Sponge",
    "Image": "Black-Ball Sponge.jpeg",
    "Type": "Ircinia Strobilina",
    "Habitat": "Coral reefs",
    "Color": "Black",
    "Size": "Up to 30 cm",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters",
    "Description": "The Black-Ball Sponge is a spherical sponge that is found in coral reefs in the Caribbean Sea. It is named for its black color and its ball-like shape. This sponge can grow up to 30 cm in diameter and is an important part of the coral reef ecosystem."
  },
  {
    "Name": "Boring Sponge",
    "Image": "Boring Sponge.jpg",
    "Type": "Cliona",
    "Habitat": "Coral reefs",
    "Color": "Yellow",
    "Size": "Variable",
    "Distribution": "Worldwide",
    "Depth": "Variable",
    "Description": "The Boring Sponge is a group of sponges that are found in coral reefs around the world. These sponges bore into the calcium carbonate skeletons of corals and other marine organisms. Boring sponges can grow to be a variety of sizes and colors. They play an important role in the breakdown of coral reefs."
  },
  {
    "Name": "Branching Tube Sponge",
    "Image": "Branching Tube Sponge.jpg",
    "Type": "Ailochroia crassa",
    "Habitat": "Coral reefs",
    "Color": "Purple",
    "Size": "Up to 1 m",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters",
    "Description": "The Branching Tube Sponge is a purple sponge that is found in coral reefs in the Caribbean Sea. It is named for its branching shape and its tube-like structures. This sponge can grow up to 1 meter tall and is an important part of the coral reef ecosystem."
  },
  {
    "Name": "Brown Vulcano Carpet Sponge",
    "Image": "Brown Vulcano Carpet Sponge.jpg",
    "Type": "Anthosigmella Varians",
    "Habitat": "Coral reefs",
    "Color": "Brown",
    "Size": "Up to 1 m",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters",
    "Description": "The Brown Vulcano Carpet Sponge is a brown sponge that is found in coral reefs in the Caribbean Sea. It is named for its volcano-like shape and its brown color. This sponge can grow up to 1 meter in diameter and is an important part of the coral reef ecosystem."
  },
  {
    "Name": "Brown Tube Sponge",
    "Image": "Brown Tube Sponge.jpg",
    "Type": "Agelas Conifera",
    "Habitat": "Coral reefs",
    "Color": "Brown",
    "Size": "Up to 1 m",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters",
    "Description": "The Brown Tube Sponge is a brown sponge that is found in coral reefs in the Caribbean Sea. It is named for its tube-like shape and its brown color. This sponge can grow up to 1 meter tall and is an important part of the coral reef ecosystem."
  },
    {
        "Name": "Brown Encrusting Octopus Sponge",
        "Image": "Brown Encrusting Octopus Sponge.jpg",
        "Type": "Ectyoplasia ferox",
        "Habitat": "Coral reefs",
        "Color": "Brown",
        "Size": "Up to 30 cm",
        "Distribution": "Caribbean Sea",
        "Depth": "3-30 meters",
    "Description": "The Brown Encrusting Octopus Sponge is a brown sponge that encrusts the surfaces of rocks and coral reefs in the Caribbean Sea. It is named for its octopus-like shape and its brown color. This sponge can grow up to 30 cm in diameter and is an important part of the coral reef ecosystem."
    },
    {
        "Name": "Branching Vase Sponge",
        "Image": "Branching Vase Sponge.jpg",
        "Type": "Callyspongia vaginalis",
        "Habitat": "Coral reefs",
        "Color": "Purple",
        "Size": "Up to 1 m",
        "Distribution": "Caribbean Sea",
        "Depth": "3-30 meters",
        "Description":"The Branching Vase Sponge is a purple sponge that is found in coral reefs in the Caribbean Sea. It is named for its branching shape and its vase-like structures. This sponge can grow up to 1 meter tall and is an important part of the coral reef ecosystem."
    },
    {
        "Name": "Yellow Tube Sponge",
        "Image": "Yellow Tube Sponge.jpg",
        "Type": "Aplysina fistularis",
        "Habitat": "Coral reefs",
        "Color": "Yellow",
        "Size": "Up to 1 m",
        "Distribution": "Caribbean Sea",
        "Description":"The Yellow Tube Sponge is a yellow sponge that is found in coral reefs in the Caribbean Sea. It is named for its tube-like shape and its yellow color. This sponge can grow up to 1 meter tall and is an important part of the coral reef ecosystem."
    },
    {
        "Name": "Purple Vase Sponge",
        "Image": "Purple Vase Sponge.jpeg",
        "Type": "Niphates digitalis",
        "Habitat": "Coral reefs",
        "Color": "Purple",
        "Size": "Up to 60 cm",
        "Distribution": "Caribbean Sea",
        "Depth": "3-30 meters",
        "Description":"The Purple Vase Sponge is a brightly colored sponge that is found in coral reefs in the Caribbean Sea. It is named for its vase-like shape and its purple color. This sponge can grow up to 60 cm tall and is an important part of the coral reef ecosystem."
    }
]

TD_SEPARATED = [item['Name'] for item in TEMP_DATABASE]
TD_DICT = {item['Name']: item for item in TEMP_DATABASE}
matplotlib.use('agg')


@app.route('/Search')
def Search():
    query = request.args.get('q')
    print(query)
    result = []
    for item in TEMP_DATABASE:
        for attribute in item:
            attr = f"{attribute} : {item[attribute]}"

            if query.lower().replace(" ", "") in str(attr).lower().replace(" ", "") or query.lower() in str(attr).lower().replace(" ", ""):
                result.append({"value": item, "ClosestAttribute": attr})
                break
    print(result)

    return result


@app.route("/processImage", methods=["POST"])
def processImage():
    input_image = request.files.get("image")
    print(input_image)
    if not input_image:
        return "No image uploaded!", 400
    img = Image.open(input_image)
    original_filename = input_image.filename.split('.')

    pre_uuid_filename = ' '.join([str(elem)
                                 for elem in original_filename[:-1]])
    processed_filename = f'{pre_uuid_filename}_{uuid.uuid4()}.{original_filename[-1]}'
    processed_image_path = os.path.join(
        UPLOAD_FOLDER, f'{processed_filename}')
    original_image_name = 'original_'+processed_filename
    img.save(os.path.join(UPLOAD_FOLDER, original_image_name))
    img = np.array(img)

    # Processing Happens Here
    StackedFilers = [
        {'name': 'sobel', 'iterations': 0},
        # {'name': 'equalize_adapthist', 'iterations': 1},
        {'name': 'gaussian', 'strength': 1, 'iterations': 20},
        {'name': 'equalize_adapthist', 'iterations': 1},
    ]
    x = img
    for filter in StackedFilers:
        for iteration in range(filter['iterations']):
            if (filter['name'] == 'equalize_adapthist'):
                x = exposure.equalize_adapthist(x)
            if (filter['name'] == 'gaussian'):
                # print(x.shape)
                # x = cv2.GaussianBlur(
                #     x, (filter['strength'], filter['strength']), 0)
                x = filters.gaussian(x, filter['strength'])
            if (filter['name'] == 'sobel'):
                x = filters.sobel(x)
            print(f'{filter} - {iteration}')

    x = np.array(x)
    im = Image.fromarray((x * 255).astype(np.uint8))
    im.save(processed_image_path)

    return jsonify([{"name": "Original", "image_url": f'http://127.0.0.1:5000/{UPLOAD_FOLDER}/{original_image_name}'},
                    {"name": "Processed - HE Normalization", "image_url": f'http://127.0.0.1:5000/{UPLOAD_FOLDER}/{processed_filename}'}])


@app.route('/Uploads/<filename>')
def ViewUploads(filename):
    return send_file(os.path.join(UPLOAD_FOLDER, filename), mimetype='image/jpg')


if __name__ == "__main__":
    app.run()
