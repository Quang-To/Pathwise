from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth import router as auth_router
from api.recommendation import router as ai_router
from api.learning_dashboard import router as dashboard_router
from api.goal import router as goal_router
from api.external_courses import router as external_courses_router
from api.skills_mapping import router as skills_router
from api.feedback import router as feedback_router

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root
@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to Pathwise API"}

# Routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(ai_router, prefix="/ai", tags=["AI Recommendation"])
app.include_router(dashboard_router, prefix="/user", tags=["User Dashboard"])
app.include_router(goal_router, prefix="/goal", tags=["Goal"])  
app.include_router(external_courses_router, tags=["External Courses"])
app.include_router(skills_router, tags=["Skills Mapping"])
app.include_router(feedback_router, tags=["Feedback"])
