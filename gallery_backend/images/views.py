import pandas as pd
import os
import random
from django.http import JsonResponse
from django.conf import settings

def _build_gallery(request):
    """Helper function to build the complete gallery list."""
    base_dir = settings.MEDIA_ROOT
    media_url = request.build_absolute_uri(settings.MEDIA_URL)

    # Load the Excel file with correct header row
    excel_path = os.path.join(settings.MEDIA_ROOT, 'Book1.xlsx')
    df = pd.read_excel(excel_path, header=2)  # Use header=3 if your real data starts at row 4
    # Strip spaces from column names
    df.columns = df.columns.str.strip()

    excel_path = os.path.join(settings.MEDIA_ROOT, 'Book1.xlsx')
    print("Excel path:", excel_path)
    df = pd.read_excel(excel_path, header=2)
    print(df.head())

    gallery = []

    if not os.path.exists(base_dir):
        return JsonResponse({'detail': 'No images found'}, status=404)

    # Iterate files in numeric order when possible (so 2.jpg comes before 10.jpg)
    def numeric_key(name):
        try:
            return int(os.path.splitext(name)[0])
        except Exception:
            return float('inf')

    for file_name in sorted(os.listdir(base_dir), key=numeric_key):
        file_path = os.path.join(base_dir, file_name)
        if os.path.isfile(file_path) and file_name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
            # Extract the numeric part from the file name (e.g., "1.jpg" -> 1)
            try:
                image_number = int(os.path.splitext(file_name)[0])
            except ValueError:
                print("-------------------------")
                continue  # Skip files that don't start with a number

            row = df[df['Α/Α'] == float(image_number)]
            print(f"Filename number: {image_number}, Α/Α in Excel: {row['Α/Α'].values if not row.empty else 'Not found'}")

            if not row.empty:
                row_data = row.iloc[0]
                def safe_value(val):
                    return "" if pd.isna(val) or val is None else str(val)
                gallery.append({
                    "id": str(image_number),
                    "url": f"{media_url}{file_name}",
                    "title": safe_value(row_data.get('ΘΕΜΑ', '')),
                    "description": safe_value(row_data.get('ΠΕΡΙΓΡΑΦΗ', '')),
                    "artist": safe_value(row_data.get('ΖΩΓΡΑΦΟΣ', '')),
                    "year": safe_value(row_data.get('ΧΡΟΝΟΣ', '')),
                    "dimensions": safe_value(row_data.get('ΔΙΑΣΤΑΣΕΙΣ', '')),
                    "cost": safe_value(row_data.get('ΚΟΣΤΟΣ ΙΔΙΟΚΤΗΣΙΑΣ', '')),
                    "price_50": safe_value(row_data.get('Τιμή -50%', '')),
                    "materials": safe_value(row_data.get('ΥΛΙΚΑ', '')),
                    "number": image_number
                })
            else:
                gallery.append({
                    "id": str(image_number),
                    "url": f"{media_url}{file_name}",
                    "title": "",
                    "description": "",
                    "artist": "",
                    "year": "",
                    "dimensions": "",
                    "materials": "",
                    "number": image_number
                })


            # image_number increment removed — we derive number per-file above
    gallery.sort(key=lambda x: x['number'])
    
    # Replace empty strings with appropriate default values
    for item in gallery:
        if not item.get('title') or item['title'].strip() == '':
            item['title'] = 'Untitled'
        if not item.get('description') or item['description'].strip() == '':
            item['description'] = 'No description available'
        if not item.get('artist') or item['artist'].strip() == '':
            item['artist'] = 'Unknown artist'
        if not item.get('year') or item['year'].strip() == '':
            item['year'] = 'Unknown year'
        if not item.get('dimensions') or item['dimensions'].strip() == '':
            item['dimensions'] = 'Unknown dimensions'
        if not item.get('materials') or item['materials'].strip() == '':
            item['materials'] = 'Unknown materials'
    
    return gallery

def gallery_view(request, id=None):
    """Return all gallery images or a specific image by ID."""
    gallery = _build_gallery(request)
    
    if id:
        item = next((x for x in gallery if x['id'] == str(id)), None)
        if item:
            return JsonResponse(item)
        return JsonResponse({'detail': 'Not found'}, status=404)

    return JsonResponse(gallery, safe=False)

def random_gallery_view(request):
    """Return 7 random images from the gallery."""
    gallery = _build_gallery(request)
    
    # Select up to 7 random images
    count = min(7, len(gallery))
    random_images = random.sample(gallery, count) if count > 0 else []
    
    return JsonResponse(random_images, safe=False)

