import threading
import logging

# Create a lock and a global variable to track the number of active users
active_requests = 0
lock = threading.Lock()

logger = logging.getLogger(__name__)

class ActiveUsersMiddleware:
    """
    Middleware that tracks the number of active requests and logs the count.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        global active_requests

        # Lock to prevent race conditions
        with lock:
            active_requests += 1
            logger.info(f"Active users (requests): {active_requests}")

        # Get the response
        response = self.get_response(request)

        # After request is processed, decrease the active user count
        with lock:
            active_requests -= 1

        return response
