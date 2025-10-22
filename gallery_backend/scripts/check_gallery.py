import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gallery_backend.settings')
django.setup()

from django.test import RequestFactory
from images.views import gallery_view

req = RequestFactory().get('/images/gallery/', HTTP_HOST='localhost')
resp = gallery_view(req)

print('HTTP status:', getattr(resp, 'status_code', 'N/A'))
content = resp.content.decode()
# Print a truncated JSON for manual inspection
print('JSON length:', len(content))
try:
    data = json.loads(content)
    ids = [item.get('id') for item in data]
    print('First 50 ids:', ids[:50])
    # check numeric sorted
    numeric_ids = [int(x) for x in ids]
    print('Is numerically sorted?:', numeric_ids == sorted(numeric_ids))
except Exception as e:
    print('Failed to parse JSON:', e)
    print(content)
