from rest_framework import serializers
from utils.supabase import supabase
from .models import (
    User,
    Role,
    Location,
    Estimate,
    Pipeline,
    Bucket,
    Dataset,
    Snapshot,
    Filter,
    Operation,
    NNModel,
    ThreeDModel,
)
from icecream import ic


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "name", "password")
        # extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        email = validated_data.get("email")

        ic(password, email)
        ic(validated_data)
        if password and email:
            response = supabase.auth.sign_up({"email": email, "password": password})
            # ic(response)
            ic(response.user.id)
            # validated_data["id"] = response.user.id
            # Create user
            user = User(id=response.user.id, **validated_data)
            user.save()

            return user


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"

    def create(self, validated_data):
        # Extract and hash the password
        name: str = validated_data.pop("name", None)

        if name:
            validated_data["name"] = name.lower()

        # Create user
        role = super().create(validated_data)

        return role


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = "__all__"


class EstimateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estimate
        fields = "__all__"


class PipelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pipeline
        fields = "__all__"


class BucketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bucket
        fields = "__all__"


class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = "__all__"


class SnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snapshot
        fields = "__all__"


class FilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filter
        fields = "__all__"


class OperationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operation
        fields = "__all__"


class NNModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NNModel
        fields = "__all__"


class ThreeDModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThreeDModel
        fields = "__all__"
