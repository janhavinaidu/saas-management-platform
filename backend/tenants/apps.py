from django.apps import AppConfig

class TenantsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tenants'

    # We must import our signals here to make them work!
    def ready(self):
        import tenants.signals
