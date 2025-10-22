import pandas as pd
import os
from django.http import JsonResponse
from django.conf import settings

def gallery_view(request, id=None):
    base_dir = settings.MEDIA_ROOT
    media_url = request.build_absolute_uri(settings.MEDIA_URL)

    # Load the Excel file with correct header row
    excel_path = r"C:\Users\sflou\Desktop\playground\gallery_backend\paintings\Book1.xlsx"
    df = pd.read_excel(excel_path, header=2)  # Use header=3 if your real data starts at row 4
    # Strip spaces from column names
    df.columns = df.columns.str.strip()

    # Clean up the DataFrame (drop rows with NaN in 'Α/Α')
    df = df[df['Α/Α'].notna()]
    print(df.head())  # Debugging line to check DataFrame content
    # ...existing code...

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
                    "cost": "",
                    "price_50": "",
                    "materials": "",
                    "number": image_number
                })


            # image_number increment removed — we derive number per-file above
    gallery.sort(key=lambda x: x['number'])
    if id:
        item = next((x for x in gallery if x['id'] == str(id)), None)
        if item:
            return JsonResponse(item)
        return JsonResponse({'detail': 'Not found'}, status=404)

    return JsonResponse(gallery, safe=False)