import os
import sys
import subprocess
from pathlib import Path

def get_python_executable():
    """Get the Python executable from the virtual environment"""
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        # We're in a virtualenv
        if sys.platform == 'win32':
            return str(Path(sys.prefix) / 'Scripts' / 'python.exe')
        return str(Path(sys.prefix) / 'bin' / 'python')
    return sys.executable

def main():
    # Set environment variables for local development
    os.environ.setdefault('DATABASE_URL', 'sqlite:///./local.db')
    os.environ.setdefault('PORT', '8501')
    
    # Get the absolute path to the app
    app_path = Path(__file__).parent / 'FraudGuardStream' / 'app.py'
    
    # Ensure we're using the correct Python with streamlit module
    python = get_python_executable()
    
    # Run streamlit using Python -m to ensure we use the right environment
    cmd = [
        python, '-m', 'streamlit', 'run', str(app_path),
        '--server.port', os.environ['PORT'],
        '--server.address', '0.0.0.0',
        '--server.headless', 'true'
    ]
    
    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"Error running app: {e}")
        raise

if __name__ == '__main__':
    main()