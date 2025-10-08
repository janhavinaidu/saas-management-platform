# Generated migration for adding department field to Profile model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tenants', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='department',
            field=models.CharField(blank=True, help_text="User's department", max_length=100, null=True),
        ),
    ]
