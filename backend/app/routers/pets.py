from app.schemas.pets import PetAdoptRequest
from app.dependencies import PetServiceDep
from app.dependencies import UserDep
from app.schemas.pets import PetRead
from fastapi import APIRouter

pet_router = APIRouter(prefix='/api/pets', tags=["pets"])

@pet_router.get("/me", response_model=PetRead)
async def get_my_pet(user: UserDep, service: PetServiceDep):
    data = await service.get_pet_status(user.id)
    return PetRead(**data["pet"].model_dump(), can_revive=data["can_revive"])

@pet_router.post("/revive", response_model=PetRead)
async def revive_pet(user: UserDep, service: PetServiceDep):
    return await service.revive(user.id)

@pet_router.post("/adopt", response_model=PetRead)
async def adopt_pet(data: PetAdoptRequest, user: UserDep, service: PetServiceDep):
    return await service.adopt(user.id, data)