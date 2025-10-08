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

# Model for issue reports submitted by users
class IssueReport(models.Model):
    class IssueType(models.TextChoices):
        ACCESS_ISSUE = 'ACCESS_ISSUE', 'Cannot Access / Login Problem'
        PERFORMANCE = 'PERFORMANCE', 'Performance / Slow'
        BUG = 'BUG', 'Bug / Error'
        LICENSE_EXPIRED = 'LICENSE_EXPIRED', 'License Expired'
        FEATURE_REQUEST = 'FEATURE_REQUEST', 'Feature Request'
        OTHER = 'OTHER', 'Other'

    class IssueStatus(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'

    # The user who reported the issue
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_issues')
    
    # The software application the issue is about
    software_name = models.CharField(max_length=200)
    
    # Type and status of the issue
    issue_type = models.CharField(max_length=20, choices=IssueType.choices)
    status = models.CharField(max_length=15, choices=IssueStatus.choices, default=IssueStatus.OPEN)
    
    # Description of the issue
    description = models.TextField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.get_issue_type_display()} - {self.software_name} by {self.reported_by.username}"

