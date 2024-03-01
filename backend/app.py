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

from operator import itemgetter
import pprint
from PIL import Image
import cv2
from skimage import filters, exposure
from flask import Flask, jsonify, send_file, request
import os
from flask_cors import CORS
import json
import uuid
import numpy as np
import matplotlib
import enchant
app = Flask(__name__)
cors = CORS(app)
UPLOAD_FOLDER = "Uploads"
from functools import cmp_to_key


with open('public/data.json') as f:
    DATASET=json.load(f)['Dataset']


TD_SEPARATED = [item['Name'] for item in DATASET]
TD_DICT = {item['Name']: item for item in DATASET}
matplotlib.use('agg')


def SortBySimilarity(a,b):
    if a['similarity'] < b['similarity']:
        return -1
    elif a['similarity'] > b['similarity']:
        return 1
    else:
        return 0

@app.route('/GetDetails')
def GetDetails():
    query = request.args.get('q')
    return next((d for d in DATASET if d["Name"] == query), None) 
@app.route('/Search')
def Search():
    query = request.args.get('q')
    # print(query)
    result = []
    MaxSim=0
    for item in DATASET:
        item['similarity']=enchant.utils.levenshtein(query, item['Name'])
        MaxSim=item['similarity'] if item['similarity']>MaxSim else MaxSim 
    print(MaxSim)
    for item in DATASET:
        if(item['similarity']<(((MaxSim)*3)/3)):
            result.append({"value": item,"similarity":item['similarity'], "ClosestAttribute": f"{'Similarity'} : {item['similarity']}"})
        # print(DATASET)
        # =enchant.utils.levenshtein(query, item['Name'])
        # MaxSim=item['similarity'] if item['similarity']>MaxSim else MaxSim 
        
        # if query.lower() in "".join(enchant.utils.levenshtein(string1, string2)).strip().replace(' ','').lower():
        # for attribute in item:
        #     attr = f"{attribute} : {item[attribute]}"
        #     print(attr)
        #     if query.lower().replace(" ", "") in str(attr).lower().replace(" ", "") or query.lower() in str(attr).lower().replace(" ", ""):
        #         result.append({"value": item, "ClosestAttribute": attr})
        #         break
    sorted(result, key=itemgetter('similarity'))
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


@app.route('/public/<filename>')
def ViewPublic(filename):
    print(filename)
    return send_file(os.path.join('public/Images/', filename), mimetype='image/jpg')


if __name__ == "__main__":
    app.run(debug=True)
