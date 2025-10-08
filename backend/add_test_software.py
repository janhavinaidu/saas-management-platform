import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_project.settings')
django.setup()

from api.models import SaaSApplication
from datetime import date

# Add some test software applications
software_list = [
    {
        'name': 'Figma Professional',
        'vendor': 'Figma Inc',
        'category': 'Design',
        'total_licenses': 10,
        'monthly_cost': 120.00,
        'renewal_date': date(2025, 12, 31)
    },
    {
        'name': 'Adobe Creative Cloud',
        'vendor': 'Adobe',
        'category': 'Design',
        'total_licenses': 5,
        'monthly_cost': 299.99,
        'renewal_date': date(2025, 11, 15)
    },
    {
        'name': 'Slack Business',
        'vendor': 'Slack Technologies',
        'category': 'Communication',
        'total_licenses': 50,
        'monthly_cost': 400.00,
        'renewal_date': date(2026, 1, 1)
    },
    {
        'name': 'Jira Software',
        'vendor': 'Atlassian',
        'category': 'Project Management',
        'total_licenses': 20,
        'monthly_cost': 150.00,
        'renewal_date': date(2025, 10, 30)
    }
]

for software_data in software_list:
    software, created = SaaSApplication.objects.get_or_create(
        name=software_data['name'],
        defaults=software_data
    )
    if created:
        print(f"✓ Created: {software.name}")
    else:
        print(f"- Already exists: {software.name}")

print("\nDone! Software applications are ready.")
