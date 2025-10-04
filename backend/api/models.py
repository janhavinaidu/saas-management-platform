from django.db import models
from django.contrib.auth.models import User

# Model for the software applications you are tracking.
class SaaSApplication(models.Model):
    name = models.CharField(max_length=100)
    vendor = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    total_licenses = models.PositiveIntegerField()
    monthly_cost = models.DecimalField(max_digits=10, decimal_places=2)
    renewal_date = models.DateField()
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

# Model for the license requests made by Department Heads.
class LicenseRequest(models.Model):
    class RequestType(models.TextChoices):
        GRANT = 'GRANT', 'Grant'
        REVOKE = 'REVOKE', 'Revoke'

    class RequestStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    request_type = models.CharField(max_length=10, choices=RequestType.choices)
    status = models.CharField(max_length=10, choices=RequestStatus.choices, default=RequestStatus.PENDING)
    
    # The user for whom the license is being requested.
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='license_requests')
    
    # The software application being requested.
    software = models.ForeignKey(SaaSApplication, on_delete=models.CASCADE)
    
    # The Department Head who made the request.
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_requests')
    
    reason = models.TextField(blank=True, help_text="Reason for the request.")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_request_type_display()} request for {self.software.name}"

