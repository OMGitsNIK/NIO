from django import forms

class AuthForm(forms.Form):
    email = forms.EmailField(required=True)
    password = forms.CharField(required=True)
