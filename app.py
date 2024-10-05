from flask import Flask, request
from flask_cors import CORS
import csv
import requests 

app = Flask(__name__)
CORS(app)

API_KEY = 'ymtaa92lgisrrqlq0dicowo4k84tl6'
BARCODE_LOOKUP_URL = 'https://api.barcodelookup.com/v3/products'

@app.route('/scan', methods=['POST'])
def scan_barcode():
    barcode_data = request.json.get('barcode', '')
    print(barcode_data)
    if barcode_data:
        product_details = get_product_details(barcode_data)
        
        with open('barcodes.csv', mode='a', newline='') as file:
            writer = csv.writer(file)
            if file.tell() == 0:  # Add header if file is empty
                writer.writerow(['Barcode', 'Title', 'Description'])
            
            # If product details are found, save them; otherwise, save "N/A" for title and description
            if product_details:
                writer.writerow([barcode_data, product_details['title'], product_details['description']])
                return {"message": "Barcode and product details saved successfully"}, 200
            else:
                writer.writerow([barcode_data, 'N/A', 'N/A'])
                return {"message": "Barcode saved, but product details not found"}, 200
    return {"error": "No barcode provided"}, 400

def get_product_details(barcode):
    # default_barcode = 8901526603466
    try:
        print("here")
        response = requests.get(
            BARCODE_LOOKUP_URL,
            params={'barcode': barcode, 'key': API_KEY}  # put barcode here
        )
        print(response.url)
        if response.status_code == 200:
            data = response.json()
            if data['products']:
                product = data['products'][0]
                title = product.get('title', 'N/A')  
                description = product.get('description', 'N/A')  
                return {"title": title, "description": description}
        else:
            print(f"Error fetching product details: {response.status_code}")
    except Exception as e:
        print(f"Error occurred: {e}")
    
    return None 

if __name__ == '__main__':
    app.run(debug=True)