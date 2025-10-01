from pytest import fixture
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.config import DATABASE_URL

@fixture(scope='session')
def db_engine():
    engine = create_engine(DATABASE_URL)
    yield engine
    engine.dispose()

@fixture(scope='session')
def db_session(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()

    Base.metadata.create_all(bind=db_engine)

    yield session

    session.close()
    transaction.rollback()
    connection.close()