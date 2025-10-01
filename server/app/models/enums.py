from enum import Enum as PyEnum


class UserRole(str, PyEnum):
    admin = "admin"
    member = "member"


class ProjectStatus(str, PyEnum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


class TaskStatus(str, PyEnum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class TaskPriority(str, PyEnum):
    low = "low"
    medium = "medium"
    high = "high"
