import sys
import os

# Ensure backend package is discoverable by Python runtime on Vercel
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import app
