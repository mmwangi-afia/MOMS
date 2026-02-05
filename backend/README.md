running the backend 
activate the virtual environment
in the project path:
- python -v venv venv
- source venv/Scripts/activate
set the variables 
- $env:FLASK_ENV = "development"
- export FLASK_APP=app.py
- export PYTHONPATH=$(pwd)
then 
flask run or python.app.py