from schemas.feedback_schema import InputFeedBack, FeedBackResponse
from database.db import COURSERA
from database.session import get_data, upsert_data
import json
import logging

logger = logging.getLogger(__name__)

def add_feedback(feedback_data: InputFeedBack) -> FeedBackResponse:
    try:
        rows = get_data(schema=COURSERA.COURSE_DATABASE, table_name=COURSERA.COURSES_TABLE)
        if not rows:
            return FeedBackResponse(status="Course ID not found")

        course_row = next(
            (row for row in rows if row.get(COURSERA.COURSE_ID) == feedback_data.course_id),
            None
        )
        if not course_row:
            return FeedBackResponse(status="Course ID not found")
        old_feedback = course_row.get(COURSERA.COURSE_FEEDBACK) or "[]"
        try:
            old_feedback = json.loads(old_feedback)
        except Exception:
            old_feedback = []
        old_feedback.append({
            "user_id": feedback_data.user_id,
            "feedback": feedback_data.feedback
        })
        updated_row = course_row.copy()
        updated_row[COURSERA.COURSE_FEEDBACK] = json.dumps(old_feedback)
        upsert_data(
            data=[updated_row],
            schema=COURSERA.COURSE_DATABASE,
            table_name=COURSERA.COURSES_TABLE,
            conflict_cols=[COURSERA.COURSE_ID]
        )

        return FeedBackResponse(status="Feedback added successfully")

    except Exception as e:
        logger.error(f"Feedback error: {e}")
        return FeedBackResponse(status=f"Feedback error: {e}")
