import jwt
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import json
from .forms import AuthForm
from v1.models import User
import bcrypt
from icecream import ic


@csrf_exempt
def auth(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            form = AuthForm(data)

            if form.is_valid():
                email = form.cleaned_data["email"]
                password = form.cleaned_data["password"]

                # Authenticate user using the database
                user = User.objects.filter(email=email).first()
                if user and bcrypt.checkpw(
                    password.encode("utf-8"), user.password.encode("utf-8"),
                ):  # Use bcrypt for custom models
                    # Generate JWT
                    payload = {
                        "id": str(user.id),
                        "email": user.email,
                        "name": user.name,
                    }
                    token = jwt.encode(
                        payload, settings.NEXTAUTH_SECRET, algorithm="HS256"
                    )

                    return JsonResponse(
                        {
                            "user": {
                                "id":str( user.id),
                                "email": user.email,
                                "name": user.name,
                            },
                            "access_token": token,
                        }
                    )

                return JsonResponse({"error": "Invalid email or password"}, status=401)

            return JsonResponse({"error": form.errors}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"error": "Only POST method is allowed"}, status=405)





@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print(data)

            form = AuthForm(data)
            print(form)
            if form.is_valid():
                email = form.cleaned_data["email"]
                password = form.cleaned_data["password"]
                print(email, password)

                # Check if the user already exists
                user = User.objects.filter(email=email).first()

                if user:
                    ic(user)
                    return JsonResponse({"error": "User already exists"}, status=400)

                # Generate JWT first before saving user
                payload = {
                    "id": "",  # Placeholder, to be replaced after user creation
                    "email": email,
                    "name": email.split("@")[0],  # Temporary name
                }
                token = jwt.encode(payload, settings.NEXTAUTH_SECRET, algorithm="HS256")

                # Only create the user after the token generation
                user = User.objects.create(
                    email=email,
                    name=email.split("@")[0],  # Use part of the email as name
                    password=bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
                )
                user.save()

                # Now that user is created, update the JWT payload with correct user ID
                payload["id"] = str(user.id)
                token = jwt.encode(payload, settings.NEXTAUTH_SECRET, algorithm="HS256")

                return JsonResponse(
                    {
                        "user": {"id": str(user.id), "email": user.email, "name": user.name},
                        "access_token": token,
                    }
                )
            ic(form.errors)
            return JsonResponse({"error": form.errors}, status=400)

        except json.JSONDecodeError as e:
            ic(e)
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"error": "Only POST method is allowed"}, status=405)
