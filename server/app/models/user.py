from sqlalchemy import Column, String, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from app.database import Base
from app.models.task import Task

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum("admin", "member", name="user_roles"),default="member"  ,nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    projects = relationship("Project", back_populates="creator")
    tasks = relationship("Task", back_populates="assignee", foreign_keys=[Task.assigned_to])
    activity_logs = relationship("ActivityLog", back_populates="user")
    member_projects = relationship("Project", secondary="project_members", back_populates="members")
    created_tasks = relationship("Task", back_populates="creator", foreign_keys=[Task.created_by])