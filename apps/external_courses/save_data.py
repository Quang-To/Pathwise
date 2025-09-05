from typing import List, Dict
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType, utility
from database.session import connect_milvus
from database.db import COURSERAMilvusFields
from core.config import Settings

settings = Settings()


def create_course_collection(drop_if_exists: bool = False) -> Collection:
    """
    Create a Milvus collection for storing course data.
    If `drop_if_exists` is True, the existing collection will be removed before creating a new one.
    """
    print("Connecting to Milvus...")
    connect_milvus()

    # Check if the collection already exists
    if utility.has_collection(COURSERAMilvusFields.COLLECTION_NAME):
        if drop_if_exists:
            try:
                utility.drop_collection(COURSERAMilvusFields.COLLECTION_NAME)
                print(f"⚠️ Existing collection '{COURSERAMilvusFields.COLLECTION_NAME}' dropped.")
            except Exception as e:
                print(f"❌ Error while dropping collection: {e}")
        else:
            collection = Collection(name=COURSERAMilvusFields.COLLECTION_NAME)
            collection.load()
            print(f"Collection '{COURSERAMilvusFields.COLLECTION_NAME}' already exists and is loaded.")
            return collection

    # Create a new collection if not exists
    print(f"Creating a new collection '{COURSERAMilvusFields.COLLECTION_NAME}'...")
    fields = [
        FieldSchema(name="record_id", dtype=DataType.VARCHAR, is_primary=True, max_length=128),
        FieldSchema(name=COURSERAMilvusFields.COURSE_ID.value, dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name=COURSERAMilvusFields.COURSE_NAME.value, dtype=DataType.VARCHAR, max_length=512),
        FieldSchema(name=COURSERAMilvusFields.COURSE_DESCRIPTION.value, dtype=DataType.VARCHAR, max_length=10000),
        FieldSchema(name=COURSERAMilvusFields.COURSE_LEVEL.value, dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name=COURSERAMilvusFields.COURSE_SKILLS.value, dtype=DataType.VARCHAR, max_length=256),
        FieldSchema(name=COURSERAMilvusFields.COURSE_DOMAIN.value, dtype=DataType.VARCHAR, max_length=256),
        FieldSchema(name=COURSERAMilvusFields.COURSE_FEEDBACK.value, dtype=DataType.VARCHAR, max_length=10000),
        FieldSchema(name=COURSERAMilvusFields.COURSE_URI.value, dtype=DataType.VARCHAR, max_length=200),
        FieldSchema(name=COURSERAMilvusFields.EMBEDDING.value, dtype=DataType.FLOAT_VECTOR, dim=768)
    ]

    schema = CollectionSchema(fields=fields, description="Coursera courses skills embeddings")
    collection = Collection(name=COURSERAMilvusFields.COLLECTION_NAME, schema=schema)
    print(f"✅ Collection '{COURSERAMilvusFields.COLLECTION_NAME}' created successfully.")

    # Create an index for the embedding vector field
    try:
        collection.create_index(
            field_name=COURSERAMilvusFields.EMBEDDING.value,
            index_params={
                "index_type": "IVF_FLAT",
                "metric_type": "COSINE",
                "params": {"nlist": 1024}
            }
        )
        collection.load()
        print("✅ Collection is ready with embedding index.")
    except Exception as e:
        print(f"❌ Error creating index: {e}")

    return collection


def insert_course_data_batch(collection: Collection, data: List[Dict], batch_size: int = 1000):
    """
    Insert course data into Milvus in batches.
    Each skill of a course will be inserted as a separate record with the corresponding embedding.
    """
    if not data:
        print("⚠️ No data provided for insertion.")
        return

    expanded_data = []

    for course in data:
        # Extract and normalize skills
        skills = course.get(COURSERAMilvusFields.COURSE_SKILLS.value, [])
        if isinstance(skills, str):
            import re
            skills = [s.strip() for s in re.split(r",|;|\||\/", skills) if s.strip()]
        elif not isinstance(skills, list):
            skills = []

        # Normalize domain field
        domain_raw = course.get(COURSERAMilvusFields.COURSE_DOMAIN.value, "")
        if isinstance(domain_raw, list):
            domain = ", ".join(str(d) for d in domain_raw)
        elif isinstance(domain_raw, dict):
            import json
            domain = json.dumps(domain_raw, ensure_ascii=False)
        else:
            domain = str(domain_raw)

        # Build record for each skill
        for skill in skills:
            emb = course.get(COURSERAMilvusFields.EMBEDDING.value)
            if not emb or not isinstance(emb, list) or len(emb) != 768:
                continue

            record = {
                "record_id": f"{course.get(COURSERAMilvusFields.COURSE_ID.value, '')}_{skill}",
                COURSERAMilvusFields.COURSE_ID.value: str(course.get(COURSERAMilvusFields.COURSE_ID.value, "")),
                COURSERAMilvusFields.COURSE_NAME.value: str(course.get(COURSERAMilvusFields.COURSE_NAME.value, "")),
                COURSERAMilvusFields.COURSE_DESCRIPTION.value: str(course.get(COURSERAMilvusFields.COURSE_DESCRIPTION.value, "")),
                COURSERAMilvusFields.COURSE_LEVEL.value: str(course.get(COURSERAMilvusFields.COURSE_LEVEL.value, "")),
                COURSERAMilvusFields.COURSE_SKILLS.value: str(skill),
                COURSERAMilvusFields.COURSE_DOMAIN.value: domain,
                COURSERAMilvusFields.COURSE_FEEDBACK.value: str(course.get(COURSERAMilvusFields.COURSE_FEEDBACK.value, "")),
                COURSERAMilvusFields.COURSE_URI.value: str(course.get(COURSERAMilvusFields.COURSE_URI.value, "")),
                COURSERAMilvusFields.EMBEDDING.value: emb
            }
            expanded_data.append(record)

    if not expanded_data:
        print("⚠️ No valid skill records found for insertion.")
        return

    total = len(expanded_data)
    print(f"Total skill records to insert: {total}")

    # Insert records in batches
    for i in range(0, total, batch_size):
        batch_slice = expanded_data[i:i + batch_size]
        batch = [
            [item["record_id"] for item in batch_slice],
            [item[COURSERAMilvusFields.COURSE_ID.value] for item in batch_slice],
            [item[COURSERAMilvusFields.COURSE_NAME.value] for item in batch_slice],
            [item[COURSERAMilvusFields.COURSE_DESCRIPTION.value] for item in batch_slice],
            [item[COURSERAMilvusFields.COURSE_LEVEL.value] for item in batch_slice],
            [item[COURSERAMilvusFields.COURSE_SKILLS.value] for item in batch_slice],
            [item[COURSERAMilvusFields.COURSE_DOMAIN.value] for item in batch_slice],
            [item[COURSERAMilvusFields.COURSE_FEEDBACK.value] for item in batch_slice],
            [item[COURSERAMilvusFields.COURSE_URI.value] for item in batch_slice],
            [item[COURSERAMilvusFields.EMBEDDING.value] for item in batch_slice],
        ]
        try:
            collection.insert(batch)
            collection.flush()
            print(f"✅ Inserted batch {i // batch_size + 1} ({len(batch_slice)} records)")
        except Exception as e:
            print(f"❌ Error inserting batch {i // batch_size + 1}: {e}")


def save_courses_embeddings(courses_data: List[Dict]) -> None:
    """
    Save course embeddings into Milvus.
    This will recreate the collection and insert all provided course embeddings.
    """
    try:
        connect_milvus()

        # Drop collection if it already exists
        if utility.has_collection(COURSERAMilvusFields.COLLECTION_NAME):
            try:
                utility.drop_collection(COURSERAMilvusFields.COLLECTION_NAME)
                print(f"⚠️ Existing collection '{COURSERAMilvusFields.COLLECTION_NAME}' dropped.")
            except Exception as e:
                print(f"❌ Error dropping collection: {e}")

        # Create collection and insert data
        collection = create_course_collection(drop_if_exists=False)
        insert_course_data_batch(collection, courses_data, batch_size=1000)
        print("✅ Embeddings saved successfully.")
    except Exception as e:
        print(f"❌ Error saving embeddings: {e}")
