from .coursera import collect_courses_data
from database.db import COURSERAMilvusFields, COURSERA
from database.session import insert_data
from .embedding import embed_course_skills
from .save_data import save_courses_embeddings
from schemas.external_courses_schema import ExternalCourseResponse
import pandas as pd

def main() -> ExternalCourseResponse:
    try:
        courses_data = collect_courses_data()

        if 'id' in courses_data.columns:
            courses_data = courses_data.drop_duplicates(subset='id')
        elif 'slug' in courses_data.columns:
            courses_data = courses_data.drop_duplicates(subset='slug')

        courses_list = courses_data.to_dict(orient="records")

        insert_data(courses_list, COURSERA.COURSE_DATABASE.value, COURSERA.COURSES_TABLE.value)

        courses_list = embed_course_skills(data = courses_list)

        save_courses_embeddings(courses_list)
        print("Saved embedding")

        return ExternalCourseResponse(status="Collection and mapping completed successfully.")

    except Exception as e:
        return ExternalCourseResponse(status=f"Error: {str(e)}")