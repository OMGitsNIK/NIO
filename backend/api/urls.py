from django.urls import path
from .views import auth,register

urlpatterns = [
    path('auth/', auth, name='auth'),
    path('register/',register,name='register')
]
