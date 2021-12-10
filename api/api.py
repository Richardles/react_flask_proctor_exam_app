from os import pathsep
import sys
from flask import Flask, request, redirect, session
import time, json
import requests

app = Flask(__name__)
app.config['SECRET_KEY'] = 'exam_app_sunib'

API_BASE_URL = "https://laboratory.binus.ac.id/lapi/api/"
MAIN_URL = "http://localhost:3000/"
SEMESTER_CODE_ODD_2021_2022 = "2110" # ->
SEMESTER_ID_ODD_2021_2022 = "81fbcf76-7fe7-424c-9f53-990e2051f137"
QUIZ_EXAM_SCHEDULE = "Schedule/GetStudentAssignmentAndFinalExamSchedule?semesterId=81fbcf76-7fe7-424c-9f53-990e2051f137&binusianNumber=2301882104&courseCode=COMP6153001"
STUDENT_SUBJECTS = "Schedule/GetStudentSchedulesOverviewBySemester?nim=2301882104&semesterCode=2110"

@app.route('/get-session')
def get_sesion():
    print(session['account'], file=sys.stderr)
    if session['account'] is None:
        return ""
    return session['account']

@app.route('/login', methods=['POST'])
def get_user_by_username_password():
    username = request.form['username'];
    password = request.form['password'];
    detail = {
        'username' : username,
        'password' : password
    }
    # print(username, file=sys.stderr)
    # print(password, file=sys.stderr)
    # LogOnBinusian -> Binusian
    # LogOn -> to get access token
    # GetMyIdentity -> pass access token to get identity
    
    req = requests.post(API_BASE_URL + "Account/LogOn", data=detail)
    bearer_token = {
        'Authorization' : 'Bearer ' + (json.loads(req.text))["access_token"]
    }
    req_identity = requests.get(API_BASE_URL + "Account/Me", headers=bearer_token)
    
    # req_exam_schedule = requests.get(API_BASE_URL + QUIZ_EXAM_SCHEDULE)
    # req_student_subjects = requests.get(API_BASE_URL + STUDENT_SUBJECTS)
    #  print(req_student_subjects.text)
    # print((json.loads(req.text))["access_token"])
    # print(req_identity.text)
    
    if req.text is "":
        return redirect(MAIN_URL + "login")
    else:
        session["account"] = req_identity.text
        return redirect(MAIN_URL + "home/schedule")

