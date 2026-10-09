from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

# schemas/pets.py
class PetRead(BaseModel):
    id: UUID
    species: str
    nickname: str | None
    health: int
    status: str
    can_revive: bool = False
    born_at: datetime | None
    died_at: datetime | None

    class Config:
        from_attributes = True

class PetAdoptRequest(BaseModel):
    species: str
    nickname: str = Field(min_length=1, max_length=50)