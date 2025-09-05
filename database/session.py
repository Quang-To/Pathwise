from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
from core.config import Settings
from pymilvus import connections, Collection
from database.db import EmployeeCourse

settings = Settings()


def get_data(schema: str, table_name: str) -> Optional[List[Dict[str, Any]]]:
    db_settings = settings.database

    db_url = (
        f"postgresql+psycopg2://{db_settings.USER}:{db_settings.PASSWORD}"
        f"@{db_settings.ENDPOINT}:{db_settings.PORT}/{db_settings.DATABASE}"
    )

    try:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=5,
            connect_args={"sslmode": "require"},
            echo=False
        )

        SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

        @contextmanager
        def get_db():
            db_session = SessionLocal()
            try:
                if schema:
                    db_session.execute(text(f'SET search_path TO "{schema}"'))
                yield db_session
            finally:
                db_session.close()

        with get_db() as session:
            check_query = text("""
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = :schema AND tablename = :table_name
            """)
            exists = session.execute(check_query, {"schema": schema, "table_name": table_name}).fetchone()

            if not exists:
                return None

            data_query = text(f'SELECT * FROM "{schema}"."{table_name}"')
            result = session.execute(data_query)
            columns = result.keys()
            data = [dict(zip(columns, row)) for row in result.fetchall()]
            return data

    except Exception as e:
        raise


def connect_milvus(alias: str = "default"):
    milvus_settings = Settings().milvus
    try:
        connections.connect(
            alias=alias,
            host=milvus_settings.HOST,
            port=milvus_settings.PORT,
        )
    except Exception as e:
        raise



def insert_data(data: List[Dict[str, Any]], schema: str, table_name: str) -> None:
    if not data:
        return

    db_settings = settings.database
    db_url = (
        f"postgresql+psycopg2://{db_settings.USER}:{db_settings.PASSWORD}"
        f"@{db_settings.ENDPOINT}:{db_settings.PORT}/{db_settings.DATABASE}"
    )

    try:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=5,
            connect_args={"sslmode": "require"},
            echo=False
        )
        SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

        @contextmanager
        def get_db():
            db_session = SessionLocal()
            try:
                if schema:
                    db_session.execute(text(f'SET search_path TO "{schema}"'))
                yield db_session
            finally:
                db_session.close()

        with get_db() as session:
            col_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = :schema AND table_name = :table
            """)
            actual_columns = {row[0] for row in session.execute(col_query, {"schema": schema, "table": table_name})}

            if not actual_columns:
                return

            filtered_data = [
                {k: v for k, v in row.items() if k in actual_columns}
                for row in data
            ]

            if not filtered_data or not filtered_data[0]:
                return

            columns = list(filtered_data[0].keys())
            columns_str = ', '.join(f'"{col}"' for col in columns)
            placeholders = ', '.join([f':{col}' for col in columns])

            update_str = ', '.join([f'"{col}" = EXCLUDED."{col}"' for col in columns if col != 'id'])

            insert_stmt = text(
                f'''
                INSERT INTO "{schema}"."{table_name}" ({columns_str})
                VALUES ({placeholders})
                ON CONFLICT ("id") DO UPDATE SET {update_str}
                '''
            )

            for item in filtered_data:
                session.execute(insert_stmt, item)

            session.commit()
            print("✅ Insert / Update completed successfully.")

    except Exception as e:
        print(f"Error inserting data: {e}")
        raise


def upsert_data(data: List[Dict[str, Any]], schema: str, table_name: str, conflict_cols: List[str]) -> None:
    if not data:
        return

    db_settings = settings.database
    db_url = (
        f"postgresql+psycopg2://{db_settings.USER}:{db_settings.PASSWORD}"
        f"@{db_settings.ENDPOINT}:{db_settings.PORT}/{db_settings.DATABASE}"
    )

    try:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=5,
            connect_args={"sslmode": "require"},
            echo=False
        )
        SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

        @contextmanager
        def get_db():
            db_session = SessionLocal()
            try:
                if schema:
                    db_session.execute(text(f'SET search_path TO "{schema}"'))
                yield db_session
            finally:
                db_session.close()

        with get_db() as session:
            col_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = :schema AND table_name = :table
            """)
            actual_columns = {row[0] for row in session.execute(col_query, {"schema": schema, "table": table_name})}

            if not actual_columns:
                return
            filtered_data = [
                {k: v for k, v in row.items() if k in actual_columns}
                for row in data
            ]

            if not filtered_data or not filtered_data[0]:
                return

            columns = list(filtered_data[0].keys())
            columns_str = ', '.join(f'"{col}"' for col in columns)
            placeholders = ', '.join([f':{col}' for col in columns])
            conflict_str = ', '.join(f'"{col}"' for col in conflict_cols)
            update_str = ', '.join([f'"{col}" = EXCLUDED."{col}"'
                                    for col in columns if col not in conflict_cols])

            upsert_stmt = text(
                f'''
                INSERT INTO "{schema}"."{table_name}" ({columns_str})
                VALUES ({placeholders})
                ON CONFLICT ({conflict_str}) DO UPDATE
                SET {update_str}
                '''
            )

            for item in filtered_data:
                session.execute(upsert_stmt, item)

            session.commit()

    except Exception as e:
        raise


def update_data(data: List[Dict[str, Any]], schema: str, table_name: str, condition_cols: List[str]) -> None:
    if not data:
        return

    db_settings = settings.database
    db_url = (
        f"postgresql+psycopg2://{db_settings.USER}:{db_settings.PASSWORD}"
        f"@{db_settings.ENDPOINT}:{db_settings.PORT}/{db_settings.DATABASE}"
    )

    try:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=5,
            connect_args={"sslmode": "require"},
            echo=False
        )
        SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

        @contextmanager
        def get_db():
            db_session = SessionLocal()
            try:
                if schema:
                    db_session.execute(text(f'SET search_path TO "{schema}"'))
                yield db_session
            finally:
                db_session.close()

        with get_db() as session:
            col_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = :schema AND table_name = :table
            """)
            actual_columns = {row[0] for row in session.execute(col_query, {"schema": schema, "table": table_name})}

            if not actual_columns:
                return

            filtered_data = [
                {k: v for k, v in row.items() if k in actual_columns}
                for row in data
            ]

            if not filtered_data or not filtered_data[0]:
                return

            for item in filtered_data:
                set_str = ', '.join([f'"{col}" = :{col}' for col in item.keys() if col not in condition_cols])
                where_str = ' AND '.join([f'"{col}" = :{col}' for col in condition_cols])

                if not set_str:
                    continue

                update_stmt = text(
                    f'UPDATE "{schema}"."{table_name}" SET {set_str} WHERE {where_str}'
                )
                session.execute(update_stmt, item)

            session.commit()

    except Exception as e:
        raise

def insert_employee_courses(data: List[Dict[str, Any]]) -> None:
    if not data:
        print("No data to insert.")
        return

    # Database settings
    db_settings = settings.database
    db_url = (
        f"postgresql+psycopg2://{db_settings.USER}:{db_settings.PASSWORD}"
        f"@{db_settings.ENDPOINT}:{db_settings.PORT}/{db_settings.DATABASE}"
    )

    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=5,
        connect_args={"sslmode": "require"},
        echo=False
    )
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    @contextmanager
    def get_db():
        db_session = SessionLocal()
        try:
            # Set schema
            if EmployeeCourse.EMPLOYEE_COURSE_DATABASE.value:
                db_session.execute(
                    text(f'SET search_path TO "{EmployeeCourse.EMPLOYEE_COURSE_DATABASE.value}"')
                )
            yield db_session
        finally:
            db_session.close()

    # Câu lệnh INSERT / UPDATE theo employee_id
    columns = [
        EmployeeCourse.EMPLOYEE_ID.value,
        EmployeeCourse.COURSES.value,
        EmployeeCourse.COURSE_SKILL.value
    ]
    columns_str = ', '.join(f'"{c}"' for c in columns)
    placeholders = ', '.join(f':{c}' for c in columns)
    update_str = ', '.join(f'"{c}" = EXCLUDED."{c}"' for c in columns if c != EmployeeCourse.EMPLOYEE_ID.value)

    insert_stmt = text(
        f'''
        INSERT INTO "{EmployeeCourse.EMPLOYEE_COURSE_DATABASE.value}"."{EmployeeCourse.EMPLOYEE_COURSE_TABLE.value}" 
        ({columns_str})
        VALUES ({placeholders})
        ON CONFLICT ("{EmployeeCourse.EMPLOYEE_ID.value}") DO UPDATE SET {update_str}
        '''
    )

    try:
        with get_db() as session:
            # Batch insert
            session.execute(insert_stmt, data)
            session.commit()
            print(f"✅ Inserted / updated {len(data)} records into "
                  f"{EmployeeCourse.EMPLOYEE_COURSE_DATABASE.value}."
                  f"{EmployeeCourse.EMPLOYEE_COURSE_TABLE.value}")
    except Exception as e:
        print(f"Error inserting data: {e}")
        raise

from typing import List, Dict, Any
import numpy as np
from pymilvus import Collection
from database.session import connect_milvus
from database.db import COURSERAMilvusFields

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Tính cosine similarity giữa hai vector."""
    v1 = np.array(v1)
    v2 = np.array(v2)
    if np.linalg.norm(v1) == 0 or np.linalg.norm(v2) == 0:
        return 0.0
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

def get_vectors_by_course(collection_name: str, skill: str) -> List[Dict[str, Any]]:
    """
    Lấy tất cả vector (và thông tin khác) của một course cụ thể từ Milvus.
    Đồng thời in cosine similarity giữa các vector.
    """
    connect_milvus()
    try:
        collection = Collection(collection_name)
        collection.load()

        # Lấy tất cả field, bao gồm vector
        all_fields = [field.name for field in collection.schema.fields]

        # Query theo course_id
        expr = f'{COURSERAMilvusFields.COURSE_SKILLS.value} == "{skill}"'
        results = collection.query(expr=expr, output_fields=all_fields)

        print(f"=== Vectors for skill = '{skill}' ===")
        vectors = []

        for item in results:
            vectors.append(item[COURSERAMilvusFields.EMBEDDING.value])
            item_preview = item.copy()
            emb = item_preview[COURSERAMilvusFields.EMBEDDING.value]
            if isinstance(emb, list) and len(emb) > 10:
                item_preview[COURSERAMilvusFields.EMBEDDING.value] = emb[:10] + ["..."]
            print(item_preview)

        if len(vectors) > 1:
            print("\nCosine similarity between vectors:")
            n = len(vectors)
            for i in range(n):
                for j in range(i + 1, n):
                    sim = cosine_similarity(vectors[i], vectors[j])
                    print(f"Vector {i} <-> Vector {j}: {sim:.4f}")
        else:
            print("Only one vector, cosine similarity not applicable.")

        return results
    except Exception as e:
        print(f"Error fetching vectors for course '{skill}': {e}")
        return []

from typing import List, Dict
from pymilvus import Collection
from database.db import COURSERAMilvusFields
from database.session import connect_milvus
import numpy as np

# Giả sử embed_skills đã được import từ file embedding bạn đưa ở trên
from apps.recommendation.embedding import embed_skills

def cosine_similarity(vec1, vec2):
    """Tính cosine similarity giữa 2 vector."""
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))


def search_courses_by_text(
    text: str,
    collection_name: str,
    threshold: float = 0.9,
    top_k: int = 100
) -> List[Dict]:
    """
    Embed text -> tìm trong Milvus -> in khóa học có similarity >= threshold.
    """
    connect_milvus()

    try:
        # 1. Embed text
        print(f"🔍 Embedding query text: {text}")
        vector = embed_skills([text])[0]
        if not vector:
            print("❌ Không thể tạo vector cho text.")
            return []

        # 2. Kết nối collection
        collection = Collection(collection_name)
        collection.load()

        # 3. Tìm kiếm vector trong Milvus
        search_params = {"metric_type": "COSINE", "params": {"nprobe": 10}}
        results = collection.search(
            data=[vector],
            anns_field=COURSERAMilvusFields.EMBEDDING.value,
            param=search_params,
            limit=top_k,
            output_fields=[
                COURSERAMilvusFields.COURSE_ID.value,
                COURSERAMilvusFields.COURSE_NAME.value,
                COURSERAMilvusFields.COURSE_DESCRIPTION.value,
                COURSERAMilvusFields.COURSE_SKILLS.value,
                COURSERAMilvusFields.COURSE_LEVEL.value,
                COURSERAMilvusFields.COURSE_FEEDBACK.value,
            ],
        )

        # 4. Lọc và in kết quả theo threshold
        print(f"\n=== Courses similar to '{text}' (threshold={threshold}) ===")
        filtered_results = []
        for hits in results:
            for hit in hits:
                if hit.distance >= threshold:
                    course = {
                        "id": hit.entity.get(COURSERAMilvusFields.COURSE_ID.value),
                        "name": hit.entity.get(COURSERAMilvusFields.COURSE_NAME.value),
                        "description": hit.entity.get(COURSERAMilvusFields.COURSE_DESCRIPTION.value),
                        "skills": hit.entity.get(COURSERAMilvusFields.COURSE_SKILLS.value),
                        "level": hit.entity.get(COURSERAMilvusFields.COURSE_LEVEL.value),
                        "feedback": hit.entity.get(COURSERAMilvusFields.COURSE_FEEDBACK.value),
                        "similarity": round(hit.distance, 4)
                    }
                    filtered_results.append(course)
                    print(course)
        if not filtered_results:
            print("⚠️ Không tìm thấy khóa học nào với similarity trên threshold.")
        return filtered_results

    except Exception as e:
        print(f"❌ Error during search: {e}")
        return []
