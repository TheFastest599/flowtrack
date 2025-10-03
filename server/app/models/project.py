from sqlalchemy import Column, String, Date, Enum, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from uuid import uuid4
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from app.models.enums import ProjectStatus

project_members = Table('project_members', Base.metadata,
    Column('project_id', UUID(as_uuid=True), ForeignKey('projects.id'), primary_key=True),
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True)
)

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    deadline = Column(Date, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.pending)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc) , onupdate=datetime.now(timezone.utc))

    # Relationships
    creator = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    members = relationship("User", secondary=project_members, back_populates="member_projects")