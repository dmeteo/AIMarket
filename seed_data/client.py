import time
import logging

import requests


logger = logging.getLogger(__name__)

class APIClient:
    def __init__(self, base_url, timeout, session: requests.Session):
        self.base_url = base_url
        self.timeout = timeout
        self.session = session
        
    def request(self, method: str, path: str, **kwargs) -> requests.Response:
        params = kwargs.get("params")
        logger.info(f"REQUEST {method} {path} params={params}")
        
        start_time = time.perf_counter()
        response = self.session.request(
            method=method,
            url=f"{self.base_url}{path}",
            timeout=self.timeout,
            **kwargs,
        )
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.info(f"RESPONSE {method} {path} -> {response.status_code} time={elapsed_ms}ms")
        if response.status_code >= 400:
            logger.warning(f"RESPONSE {method} {path} returned {response.status_code}")
        
        return response
        
    def get(self, path, **kwargs) -> requests.Response:
        return self.request("GET", path, **kwargs)

    def post(self, path, **kwargs) -> requests.Response:
        return self.request("POST", path, **kwargs)
    
    def put(self, path, **kwargs) -> requests.Response:
        return self.request("PUT", path, **kwargs)
    
    def patch(self, path, **kwargs) -> requests.Response:
        return self.request("PATCH", path, **kwargs)
    
    def delete(self, path, **kwargs) -> requests.Response:
        return self.request("DELETE", path, **kwargs)
    
    def close(self):
        self.session.close()