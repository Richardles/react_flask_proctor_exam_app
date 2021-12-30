from os import pathsep
import sys
from flask import Flask, request, redirect, session
import time, json
import requests
from flask import jsonify
from flask_session.__init__ import Session
from datetime import timedelta
from flask import request
import urllib.request
from selenium import webdriver
import webbrowser

app = Flask(__name__)
app.config['SECRET_KEY'] = 'exam_app_sunib'

API_BASE_URL = "https://laboratory.binus.ac.id/lapi/api/"
MAIN_URL = "http://localhost:3000/"
SEMESTER_CODE_ODD_2021_2022 = "2110" # ->
SEMESTER_ID_ODD_2021_2022 = "81fbcf76-7fe7-424c-9f53-990e2051f137"
QUIZ_EXAM_SCHEDULE = "Schedule/GetStudentAssignmentAndFinalExamSchedule?semesterId=81fbcf76-7fe7-424c-9f53-990e2051f137&binusianNumber=2301882104&courseCode=COMP6153001"
STUDENT_SUBJECTS = "Schedule/GetStudentSchedulesOverviewBySemester?nim=2301882104&semesterCode=2110"
COURSE_OUTLINE_BY_SEMESTER = "Course/GetCourseOutlineInSemester?semesterId="
STUDENTS_BY_CLASS_CODE = "Student/Class?coId=&className=&semesterId="
bearer_token = ''

@app.route('/get-session')
def get_sesion():
    print(session['account'], file=sys.stderr)
    if session['account'] is None:
        return ""
    return session['account']

@app.route('/get-student-log', methods=['POST'])
def get_student_log():
    download_url = request.json
    req_student_log = requests.get(download_url)
    student_log_array = (req_student_log.text).replace('\r', '').split('\n')
    filtered = []
    filtered = student_log_array[2:len(student_log_array)]
    
    return jsonify(filtered)


@app.route('/download-exam-case', methods=['POST'])
def download_exam_case():
    download_url = request.json
    if download_url.find('/'):
        fileName = download_url.rsplit('/', 1)[1]
        fileName = (fileName.split('case%')[1]).split('?')
        fileName = (fileName[0]).replace('%', ' ')[2:]
        print(fileName)
    exam_case = requests.get(download_url)
    # open(fileName, 'wb').write(exam_case.content)
    # testfile = urllib.request.URLopener()
    # testfile.retrieve(download_url, fileName)
    webbrowser.open(download_url)
    
    return jsonify(exam_case.text)

@app.route('/get-active-class')
def get_active_class():
    req_active_semester = requests.get(API_BASE_URL + "Semester/Active")
    semesterId = (json.loads(req_active_semester.text))["SemesterId"]
    req_assistant_jobs = requests.get(API_BASE_URL + "Schedule/GetJobsAssistant?mode=history&semesterId="+semesterId, headers=bearer_token)
    req_coId = requests.get(API_BASE_URL + "Course/GetCourseOutlineInSemester?semesterId="+semesterId, headers=bearer_token)
    
    allCourses = []
    for i in (json.loads(req_coId.text)):
        allCourses.append(i)
        
    # print(req_assistant_jobs.text)
    temp = json.loads(req_assistant_jobs.text)
    courseList = []
    separator = " "
    for i in temp:
        if(i["JobType"].__eq__("Teaching")):
            x = (i["Description"]).split("-")
            x2 = (x[2])[:-1]
            x3 = ((x[1]+"-"+x2).strip()).split(" ")
            courseList.append(separator.join(x3))
            # print(separator.join(x3))
            # print(separator.join(x3[:-1]))
    
    courses = list(dict.fromkeys(courseList))
    coursesDict = []
    for i in courses:
        splittedCourse = i.split(" ")
        temp = {
            'Name': separator.join(splittedCourse[:-1]),
            'ClassName': splittedCourse[-1]
        }
        coursesDict.append(temp)
        # splittedCourses.append(i.split("-"))
        
    teachingTransaction = []
    for i in coursesDict:
        for x in allCourses:
            if i['Name'].__eq__(x['Name']) :
                temp = {
                    'Name': i['Name'],
                    'ClassName': i['ClassName'],
                    'CourseOutlineId': x['CourseOutlineId']
                }
                teachingTransaction.append(temp)
    
    # for i in teachingTransaction:
    #     print(i)
        
    teachingClassWithStudentsDetails = []
    def getStudentListByClass(teachingTransaction):
        idx = 1
        for i in teachingTransaction:
            coId = i['CourseOutlineId']
            className = i['ClassName']
            req_students_by_class = requests.get(API_BASE_URL + "Student/Class?coId="+coId+"&className="+className+"&semesterId="+semesterId, headers=bearer_token)
            
            tempCourseCode = ((i['Name']).split('-'))[0]
            tempCourseName = ((i['Name']).split('-'))[1]
            tempStudentList = json.loads(req_students_by_class.text)
            
            req_quiz_exam_schedule = requests.get(API_BASE_URL + "Schedule/GetStudentAssignmentAndFinalExamSchedule?semesterId="+semesterId+"&binusianNumber="+tempStudentList[0]['Number']+"&courseCode="+tempCourseCode)
            tempExamSchedule = json.loads(req_quiz_exam_schedule.text)
            
            temp = {
                'Id': idx,
                'CourseCode': tempCourseCode,
                'CourseName': tempCourseName,
                'Name': i['Name'],
                'ClassName': i['ClassName'],
                'CourseOutlineId': i['CourseOutlineId'],
                'StudentList': tempStudentList,
                'ExamSchedule': tempExamSchedule
            }
            idx+=1
            teachingClassWithStudentsDetails.append(temp)
        
    getStudentListByClass(teachingTransaction)
    
    # for i in teachingClassWithStudentsDetails:
    #     print(i)
    # print(json.dumps(teachingClassWithStudentsDetails))
    # session["class_details"] = json.dumps(teachingClassWithStudentsDetails)
    return jsonify(teachingClassWithStudentsDetails)
    # return session["class_details"]

@app.route('/login', methods=['POST'])
def get_user_by_username_password():
    username = request.form['username']
    password = request.form['password']
    detail = {
        'username' : username,
        'password' : password
    }
    # print(username, file=sys.stderr)
    # print(password, file=sys.stderr)
    # LogOnBinusian -> Binusian
    # LogOn -> to get access token
    # GetMyIdentity (..Account/Me)-> pass access token to get identity
    
    req_token = requests.post(API_BASE_URL + "Account/LogOn", data=detail)
    global bearer_token
    bearer_token = {
        'Authorization' : 'Bearer ' + (json.loads(req_token.text))["access_token"]
    }
    
    req_identity = requests.get(API_BASE_URL + "Account/Me", headers=bearer_token)
    
    print(req_identity.text)
    
    if req_token.text == "":
        return redirect(MAIN_URL + "login")
    else:
        session["account"] = req_identity.text
        return redirect(MAIN_URL + "home/schedule")

