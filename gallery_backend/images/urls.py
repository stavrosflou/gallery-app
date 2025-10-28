from django.urls import path
from .views import gallery_view, random_gallery_view

urlpatterns = [
    path('gallery/', gallery_view, name='gallery'),
    path('gallery/<int:id>/', gallery_view, name='gallery-detail'),
    path('gallery/random/', random_gallery_view, name='gallery-random'),
]
