import os
import cohere
from .models import SaaSApplication, LicenseRequest
from django.contrib.auth.models import User
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Q

# This file uses Cohere directly without LangChain to avoid version conflicts

def get_software_inventory() -> list[dict]:
    """
    Get all software applications in the inventory with their costs and license counts.
    Returns a list of dictionaries with software name, total licenses, monthly cost, and renewal date.
    """
    print("--- TOOL: Fetching software inventory ---")
    applications = SaaSApplication.objects.all()
    
    results = []
    for app in applications:
        results.append({
            "software_name": app.name,
            "vendor": app.vendor,
            "category": app.category,
            "total_licenses": app.total_licenses,
            "monthly_cost": float(app.monthly_cost),
            "renewal_date": str(app.renewal_date)
        })
    print(f"--- TOOL: Found {len(results)} software applications ---")
    return results

def get_license_request_stats() -> dict:
    """
    Analyze license request patterns to identify optimization opportunities.
    Returns statistics about pending, approved, and rejected requests.
    """
    print("--- TOOL: Analyzing license request patterns ---")
    
    total_requests = LicenseRequest.objects.count()
    pending = LicenseRequest.objects.filter(status='PENDING').count()
    approved = LicenseRequest.objects.filter(status='APPROVED').count()
    rejected = LicenseRequest.objects.filter(status='REJECTED').count()
    
    # Get most requested software
    most_requested = LicenseRequest.objects.filter(
        request_type='GRANT'
    ).values('software__name').annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    # Get revoke requests (potential unused licenses)
    revoke_requests = LicenseRequest.objects.filter(
        request_type='REVOKE'
    ).values('software__name', 'software__monthly_cost').annotate(
        count=Count('id')
    )
    
    result = {
        "total_requests": total_requests,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "most_requested_software": list(most_requested),
        "revoke_requests": list(revoke_requests)
    }
    
    print(f"--- TOOL: Analysis complete ---")
    return result


def get_user_data() -> list[dict]:
    """
    Get all users with their department, role, and email information.
    Returns a list of dictionaries with user details.
    """
    print("--- TOOL: Fetching user data ---")
    users = User.objects.all()
    
    results = []
    for user in users:
        # Get user profile data
        profile_data = {
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }
        
        # Try to get department from profile
        try:
            if hasattr(user, 'profile'):
                profile_data["department"] = user.profile.department
                profile_data["role"] = user.profile.role
            else:
                # Fallback: check if department is stored directly on user
                profile_data["department"] = getattr(user, 'department', None)
                profile_data["role"] = getattr(user, 'role', None)
        except:
            profile_data["department"] = None
            profile_data["role"] = None
        
        results.append(profile_data)
    
    print(f"--- TOOL: Found {len(results)} users ---")
    return results

def run_optimization_agent():
    """
    This function analyzes the license data and uses Cohere AI to generate optimization recommendations.
    """
    print("\n>>> INITIALIZING COHERE AI ANALYSIS...")
    
    # Get the API key from environment
    api_key = os.getenv('CO_API_KEY')
    if not api_key:
        return "Error: CO_API_KEY not found in environment variables"
    
    # Initialize Cohere client
    co = cohere.Client(api_key)
    
    # Gather data
    print(">>> Gathering software inventory data...")
    inventory = get_software_inventory()
    
    print(">>> Gathering license request statistics...")
    request_stats = get_license_request_stats()
    
    # Calculate total costs and metrics
    total_monthly_cost = sum(app['monthly_cost'] for app in inventory)
    total_licenses = sum(app['total_licenses'] for app in inventory)
    
    # Build a comprehensive prompt with the data
    prompt = f"""You are a SaaS license optimization expert analyzing an organization's software portfolio. Provide SPECIFIC, DATA-DRIVEN recommendations.

CURRENT STATE:
- Total Monthly Cost: ${total_monthly_cost:,.2f}
- Total Licenses: {total_licenses}
- Total Software Applications: {len(inventory)}

SOFTWARE INVENTORY (with costs and license counts):
{inventory}

LICENSE REQUEST PATTERNS:
{request_stats}

ANALYSIS REQUIREMENTS:
1. **Cost Optimization Opportunities**: Identify specific software with high costs and low utilization. Provide EXACT dollar amounts for potential savings.

2. **Underutilized Licenses**: List specific applications where revoke requests indicate unused licenses. Calculate exact savings per license.

3. **High-Demand Software**: Identify software with many pending/approved requests that may need more licenses.

4. **Consolidation Opportunities**: Suggest which software tools have overlapping functionality and could be consolidated.

5. **Immediate Action Items**: Provide 3-5 specific, prioritized actions with:
   - Exact software name
   - Specific number of licenses to add/remove
   - Expected monthly savings in dollars
   - Priority level (High/Medium/Low)

6. **ROI Summary**: Calculate total potential monthly savings and annual savings.

FORMAT: Use clear sections with bullet points. Include specific numbers, dollar amounts, and software names in every recommendation."""

    print(">>> Sending data to Cohere AI for analysis...")
    
    try:
        # Call Cohere API with command-r-08-2024 (current available model)
        # See https://docs.cohere.com/docs/models for available models
        response = co.chat(
            message=prompt,
            model='command-r-08-2024',
            temperature=0.3
        )
        
        print(">>> ANALYSIS COMPLETE.")
        return response.text
        
    except Exception as e:
        print(f">>> ERROR: {str(e)}")
        # If model not found, try without specifying model (uses default)
        try:
            print(">>> Retrying with default model...")
            response = co.chat(
                message=prompt,
                temperature=0.3
            )
            print(">>> ANALYSIS COMPLETE.")
            return response.text
        except Exception as e2:
            print(f">>> ERROR: {str(e2)}")
            return f"Error generating recommendations: {str(e2)}"


def chat_with_license_data(user_question: str) -> str:
    """
    Interactive chatbot that answers questions about license data
    """
    print(f"\n>>> CHATBOT: Processing question: {user_question}")
    
    # Get the API key from environment
    api_key = os.getenv('CO_API_KEY')
    if not api_key:
        return "Error: CO_API_KEY not found in environment variables"
    
    # Initialize Cohere client
    co = cohere.Client(api_key)
    
    # Gather current data
    inventory = get_software_inventory()
    request_stats = get_license_request_stats()
    user_data = get_user_data()
    
    # Calculate metrics
    total_monthly_cost = sum(app['monthly_cost'] for app in inventory)
    total_licenses = sum(app['total_licenses'] for app in inventory)
    total_users = len(user_data)
    
    # Get department breakdown
    departments = {}
    for user in user_data:
        dept = user.get('department') or 'No Department'
        departments[dept] = departments.get(dept, 0) + 1
    
    # Build context-aware prompt
    prompt = f"""You are a helpful AI assistant with access to the organization's complete SaaS license and user data. Answer the user's question based on the following comprehensive data:

CURRENT METRICS:
- Total Monthly Cost: ${total_monthly_cost:,.2f}
- Total Licenses: {total_licenses}
- Total Software Applications: {len(inventory)}
- Total Users: {total_users}
- Departments: {list(departments.keys())}

USER DATA (with departments and roles):
{user_data}

SOFTWARE INVENTORY (with costs and license counts):
{inventory}

LICENSE REQUEST STATISTICS:
{request_stats}

DEPARTMENT BREAKDOWN:
{departments}

USER QUESTION: {user_question}

Provide a clear, specific answer based on the data above. Include:
- Relevant numbers, software names, and costs
- User names, departments, and roles when applicable
- Specific lists when asked (e.g., "users in Engineering department")
- Calculations and summaries as needed

If the question asks about users, departments, or roles, use the USER DATA section. Be specific and list actual names when appropriate."""

    print(">>> CHATBOT: Sending to Cohere AI...")
    
    try:
        response = co.chat(
            message=prompt,
            model='command-r-08-2024',
            temperature=0.5
        )
        
        print(">>> CHATBOT: Response received.")
        return response.text
        
    except Exception as e:
        print(f">>> CHATBOT ERROR: {str(e)}")
        try:
            response = co.chat(
                message=prompt,
                temperature=0.5
            )
            return response.text
        except Exception as e2:
            return f"Error: {str(e2)}"
