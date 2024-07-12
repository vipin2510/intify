from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials

# Spreadsheet ID and API Key
SPREADSHEET_ID = '1u0wz3jnjb50T_6D8YCqHnpaT7Cejyg5Rafu7FBA1vZk'
API_KEY = 'AIzaSyCxrvxY0Nmf5txZwCIuTBWEEIw7HVC8bro'

# Use your credentials file
CREDENTIALS_FILE = 'client_secret_31972503524-c5ao35e1arcjb53ruskm8cpr36gm4dg5.apps.googleusercontent.com.json'

# Create credentials using the service account file
credentials = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=['https://www.googleapis.com/auth/drive'])

# Build the Drive API service
drive_service = build('drive', 'v3', credentials=credentials)

# Get the permissions of the spreadsheet
permissions = drive_service.permissions().list(fileId=SPREADSHEET_ID, fields='permissions(emailAddress, role)').execute()

# Filter and print the email addresses of users with write access
for permission in permissions.get('permissions', []):
    if permission.get('role') in ['writer', 'owner']:
        print(permission.get('emailAddress'))
