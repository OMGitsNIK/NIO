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

import difflib
from flask import Flask,request
from flask_cors import CORS
app=Flask(__name__)
cors=CORS(app)

TEMP_DATABASE=[
  {
    "Name": "Azure Vase Sponge",
    "Type": "Callyspongia Plicifera",
    "Habitat": "Coral reefs",
    "Color": "Blue",
    "Size": "Up to 60 cm",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters"
  },
  {
    "Name": "Black-Ball Sponge",
    "Type": "Ircinia Strobilina",
    "Habitat": "Coral reefs",
    "Color": "Black",
    "Size": "Up to 30 cm",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters"
  },
  {
    "Name": "Boring Sponge",
    "Type": "Cliona",
    "Habitat": "Coral reefs",
    "Color": "Yellow",
    "Size": "Variable",
    "Distribution": "Worldwide",
    "Depth": "Variable"
  },
  {
    "Name": "Branching Tube Sponge",
    "Type": "Ailochroia crassa",
    "Habitat": "Coral reefs",
    "Color": "Purple",
    "Size": "Up to 1 m",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters"
  },
  {
    "Name": "Brown Vulcano Carpet Sponge",
    "Type": "Anthosigmella Varians",
    "Habitat": "Coral reefs",
    "Color": "Brown",
    "Size": "Up to 1 m",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters"
  },
  {
    "Name": "Brown Tube Sponge",
    "Type": "Agelas Conifera",
    "Habitat": "Coral reefs",
    "Color": "Brown",
    "Size": "Up to 1 m",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters"
  },
  {
    "Name": "Brown Encrusting Octopus Sponge",
    "Type": "Ectyoplasia ferox",
    "Habitat": "Coral reefs",
    "Color": "Brown",
    "Size": "Up to 30 cm",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters"
  },
  {
    "Name": "Branching Vase Sponge",
    "Type": "Callyspongia vaginalis",
    "Habitat": "Coral reefs",
    "Color": "Purple",
    "Size": "Up to 1 m",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters"
  },
  {
    "Name": "Yellow Tube Sponge",
    "Type": "Aplysina fistularis",
    "Habitat": "Coral reefs",
    "Color": "Yellow",
    "Size": "Up to 1 m",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters"
  },
  {
    "Name": "Purple Vase Sponge",
    "Type": "Niphates digitalis",
    "Habitat": "Coral reefs",
    "Color": "Purple",
    "Size": "Up to 60 cm",
    "Distribution": "Caribbean Sea",
    "Depth": "3-30 meters"
  }
]

TD_SEPARATED=[item['Name'] for item in TEMP_DATABASE]
TD_DICT = {item['Name']: item for item in TEMP_DATABASE}



@app.route('/Search')
def Search():
    query = request.args.get('q')
    print(query)
    result = []
    for item in TEMP_DATABASE:
        for attribute in item:
            attr=f"{attribute} : {item[attribute]}"
     
            if query.lower() in str(attr).lower().replace(" ",""):
                result.append({"value":item,"ClosestAttribute":attr})
                break

    return result


if __name__ == "__main__":
    app.run(debug=True)