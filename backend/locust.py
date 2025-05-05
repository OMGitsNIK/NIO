from locust import HttpUser, TaskSet, task, between
import random

class UserBehavior(TaskSet):

    @task
    def auth(self):
        self.client.get("/api/auth/")

    @task
    def register(self):
        self.client.get("/api/register/")

    @task
    def analyze(self):
        self.client.get("/v1/analyze/")

    @task
    def dataset_list(self):
        self.client.get("/v1/1/dataset/")

    @task
    def process_image(self):
        self.client.get("/v1/process_image")

    @task
    def snapshot(self):
        self.client.get("/v1/snapshot")

    @task
    def bucket_list(self):
        self.client.get("/v1/bucket")

    @task
    def bucket_detail(self):
        self.client.get("/v1/bucket/123")

    @task
    def report_detail(self):
        self.client.get("/v1/report/456")

    @task
    def dataset_detail(self):
        self.client.get("/v1/dataset/789")

    @task
    def dataset_delete(self):
        self.client.get("/v1/dataset/789/delete/")

    @task
    def delete_snapshot(self):
        self.client.get("/v1/snapshot/999")


class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    wait_time = between(1, 5)
