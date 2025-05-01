# permissions.py
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed


class VerifiedBearerTokenPermission(BasePermission):
    """
    Allows access only if a valid bearer token is present in the request headers.
    """

    def has_permission(self, request, view):
        token = request.headers.get("Authorization")

        if not token or not token.startswith("Bearer "):
            raise AuthenticationFailed("Bearer token required.")

        bearer_token = token.split(" ")[1]

        # Replace 'your_valid_token' with the actual token or verification logic
        if (
            bearer_token != "74600241-acac-4b1a-bae4-4e04f4fc166d"
        ):  # Implement verification logic here
            raise AuthenticationFailed("Invalid bearer token.")

        return True
