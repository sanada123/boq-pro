"""Projects CRUD — wraps generic factory."""
from app.crud.base import create_entity_router
from app.models.project import Project

router = create_entity_router(Project)
