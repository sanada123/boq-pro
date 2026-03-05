from app.crud.base import create_entity_router
from app.models.price_item import PriceItem

router = create_entity_router(PriceItem)
