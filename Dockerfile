# FROM nikolaik/python-nodejs:python3.9-nodejs12
FROM python:3.9
ENV PYTHONUNBUFFERED 1

# backend dependecies
WORKDIR /code
COPY requirements.txt /code/
RUN pip install -r requirements.txt

# copy whole code later to avoid repeatedly installing dependecies
COPY . /code/

# change back the working director for running python commands
WORKDIR /code

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
