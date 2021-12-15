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
COURSE_OUTLINE_BY_SEMESTER = "Course/GetCourseOutlineInSemester?semesterId="

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
    # GetMyIdentity (..Account/Me)-> pass access token to get identity
    
    req = requests.post(API_BASE_URL + "Account/LogOn", data=detail)
    bearer_token = {
        'Authorization' : 'Bearer ' + (json.loads(req.text))["access_token"]
    }
    
    req_active_semester = requests.get(API_BASE_URL + "Semester/Active")
    semesterId = (json.loads(req_active_semester.text))["SemesterId"]
    req_identity = requests.get(API_BASE_URL + "Account/Me", headers=bearer_token)
    req_assistant_jobs = requests.get(API_BASE_URL + "Schedule/GetJobsAssistant?mode=history&semesterId="+semesterId, headers=bearer_token)
    req_coId = requests.get(API_BASE_URL + "Course/GetCourseOutlineInSemester?semesterId=" + SEMESTER_ID_ODD_2021_2022, headers=bearer_token)
    
    allCourses = []
    for i in (json.loads(req_coId.text)):
        allCourses.append(i)
        print(i)
        
    # print(req_assistant_jobs.text)
    temp = json.loads(req_assistant_jobs.text)
    courseList = []
    separator = " "
    for i in temp:
        if(i["JobType"] == "Teaching"):
            x = (i["Description"]).split("-")
            x2 = (x[2])[:-1]
            x3 = ((x[1]+"-"+x2).strip()).split(" ")
            courseList.append(separator.join(x3[:-1]))
            # print(separator.join(x3[:-1]))
    
    courses = list(dict.fromkeys(courseList))
    coursesDict = []
    for i in courses:
        temp = {
            'Name': i
        }
        coursesDict.append(temp)
        # splittedCourses.append(i.split("-"))
    res = []
    for i in coursesDict:
        for x in allCourses:
            if i['Name'].__eq__(x['Name']) :
                temp = {
                    'Name': i['Name'],
                    'CourseOutlineId': x['CourseOutlineId']
                }
                res.append(temp)
    
    for i in res:
        print(i)
    
    # req_exam_schedule = requests.get(API_BASE_URL + QUIZ_EXAM_SCHEDULE)
    # req_student_subjects = requests.get(API_BASE_URL + STUDENT_SUBJECTS)
    # print(req_student_subjects.text)
    # print((json.loads(req.text))["access_token"])
    # print(req_identity.text)
    
    if req.text is "":
        return redirect(MAIN_URL + "login")
    else:
        session["account"] = req_identity.text
        return redirect(MAIN_URL + "home/schedule")

