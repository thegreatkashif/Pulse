from pydantic import BaseModel


class NetworkDevice(BaseModel):
    ip: str
    mac: str
    hostname: str | None = None
    vendor: str | None = None
    online: bool = True