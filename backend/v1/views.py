
from django.http import (
    JsonResponse,
    HttpResponseBadRequest,
    HttpResponseServerError,
    HttpResponse,
)


from django.shortcuts import get_object_or_404
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils import dateparse, timezone
from datetime import datetime, timedelta
from icecream import ic
import bcrypt
import requests


from . import models



@csrf_exempt
# @cache_page(60 * 15)
def dataset(request):
    ic(request)
    if request.method == "GET":
        
        mock=[
            {
                "id":1,
                'title':'Maharashtra DS',
                'image':'http://localhost:8000/bucket/image/sponge.png',
                'description':'',
                'items':12,
                'createdDate':datetime.now()
            },
              {
                "id":2,
                'title':'Maharashtra DS',
                'image':'http://localhost:8000/bucket/image/sponge.png',
                'description':'',
                'items':12,
                'createdDate':datetime.now()
            },  {
                "id":3,
                'title':'Maharashtra DS',
                'image':'http://localhost:8000/bucket/image/sponge.png',
                'description':'',
                'items':200,
                'createdDate':datetime.now()
            },  {
                "id":4,
                'title':'Maharashtra DS',
                'image':'http://localhost:8000/bucket/image/sponge.png',
                'description':'',
                'items':12,
                'createdDate':datetime.now()
            },  {
                "id":5,
                'title':'Maharashtra DS',
                'image':'http://localhost:8000/bucket/image/sponge.png',
                'description':'',
                'items':12,
                'createdDate':datetime.now()
            },
        ]

        return JsonResponse(mock, safe=False)

    if request.method == "POST":
        ic("in post")
        ic(request.body)
        try:
            ic(request.body)
            data = json.loads(request.body)
            ic(data)
            # ic 
            # (request.POST.get("user_id"))

            user = get_object_or_404(models.User, id=data.get("userId"))

            if request.GET.get("new_article", False):
                print("make a blank article")
                newDataset = models.Dataset(
                    name=data['title'],visibility=data['visibility'],created_by=uset  
                )
                ic(data)
                newArticle.save()
                return JsonResponse(
                    {"result": "Article Added Successfully", "id": newArticle.id}
                )
            else:
                ic("NOT A DRAFT")

                category = get_object_or_404(
                    models.ArticleCategories, id=data["category_id"]
                )
                ic(category.name)
                newArticle = models.Article(
                    title=data["title"],
                    subtitle=data["subtitle"],
                    content=data["content"],
                    publish_date=dateparse.parse_date(data["publish_date"]),
                    category=category,
                    views=0,
                    shares=0,
                    image=data["image"],
                    user=user,  # TODO WE GET IT WITH THE REQUEST ....
                    draft=False,
                    team=team,
                )

                ic(newArticle)
                newArticle.save()
                ic("saved")

              

                return JsonResponse(
                    {"result": f"Article {newArticle.id} Added Sucessfully"}
                )
        except Exception as e:
            ic(e)
            return HttpResponseBadRequest(e)

    # Add An Article


# @csrf_exempt
# # @cache_page(60 * 15)
# def dataset_id(request):
#     ic(request)
#     if request.method == "GET":
        
#         mock=[
#             {
#                 name:'Maharashtra DS',
#                 thumbnail:'http://localhost:8000/bucket/image/sponge.png',
#                 description:'',
#                 count:12,
#                 createdDate:datetime.now()
#             }
#         ]

#         return JsonResponse(mock, safe=False)

#     if request.method == "POST":
#         ic("in post")
#         if not authenticated(request=request):
#             ic("not authenticated")

#             return JsonResponse(
#                 {"result": "YOU ARE NOT ALLOWED"}
#             )  # TODO : REPLACE WITH PROPER CODE
#         else:
#             ic("authenticated")

#             try:
#                 ic(request.body)
#                 data = json.loads(request.body)
#                 ic(data)
#                 # ic(request.POST.get("user_id"))

#                 user = get_object_or_404(models.User, id=data.get("user_id"))
#                 team = get_object_or_404(models.Team, id=data.get("team_id"))

#                 if request.GET.get("new_article", False):
#                     print("make a blank article")
#                     newArticle = models.Article(
#                         title="",
#                         subtitle="",
#                         content="",
#                         publish_date=(
#                             datetime.now() + timedelta(days=365 * 100)
#                         ).date(),
#                         category=None,
#                         views=0,
#                         shares=0,
#                         image=None,
#                         user=user,
#                         draft=True,
#                         team=team,
#                     )
#                     ic(data)
#                     newArticle.save()
#                     return JsonResponse(
#                         {"result": "Article Added Successfully", "id": newArticle.id}
#                     )
#                 else:
#                     ic("NOT A DRAFT")

#                     category = get_object_or_404(
#                         models.ArticleCategories, id=data["category_id"]
#                     )
#                     ic(category.name)
#                     newArticle = models.Article(
#                         title=data["title"],
#                         subtitle=data["subtitle"],
#                         content=data["content"],
#                         publish_date=dateparse.parse_date(data["publish_date"]),
#                         category=category,
#                         views=0,
#                         shares=0,
#                         image=data["image"],
#                         user=user,  # TODO WE GET IT WITH THE REQUEST ....
#                         draft=False,
#                         team=team,
#                     )

#                     ic(newArticle)
#                     newArticle.save()
#                     ic("saved")

#                     for _tag in data["tags"]:
#                         ic(_tag)
#                         ic(newArticle)

#                         models.ArticleTag.objects.create(
#                             tag=tag_add(_tag), article=newArticle
#                         )
#                     ic("Done")

#                     return JsonResponse(
#                         {"result": f"Article {newArticle.id} Added Sucessfully"}
#                     )
#             except Exception as e:
#                 ic(e)
#                 return HttpResponseBadRequest(e)

#     # Add An Article
