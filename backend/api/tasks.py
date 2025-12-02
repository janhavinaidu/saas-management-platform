from celery import shared_task
from .license_agent import run_optimization_agent

@shared_task
def run_license_optimization_task():
    """
    A Celery task that runs the AI agent to find optimization opportunities.
    The result is saved to the database for the frontend to retrieve.
    """
    print("Starting license optimization agent task...")
    recommendations = run_optimization_agent()
    print("Agent finished. Recommendations:")
    print(recommendations)
    
    # Try to save recommendations to database
    try:
        from .models import AIRecommendation
        AIRecommendation.objects.create(
            recommendations_text=recommendations
        )
        print("Recommendations saved to database.")
    except Exception as e:
        print(f"Could not save to database (table may not exist yet): {e}")
        print("Run migrations: python manage.py makemigrations && python manage.py migrate")
    
    return recommendations
