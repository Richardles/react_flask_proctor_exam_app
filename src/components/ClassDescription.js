import React from 'react';
import { PaperClipIcon } from '@heroicons/react/solid'
import { useParams } from "react-router-dom";
import StudentsBox from './class_descriptions_components/StudentsBox';
import UploadForm from './class_descriptions_components/UploadForm';
import { PlusSmIcon } from '@heroicons/react/solid'
import { Fragment, useState, useEffect, useRef } from 'react'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import firebase from '../firebase'

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export var currentClass

const ClassDescription = () => {

    const [isFormOpen, setFormOpen] = useState(false);
    const [caseType, setCaseType] = useState({});
    const [uploaded, setUploaded] = useState();
    const [openAlert, setOpenAlert] = React.useState(false);
    const [openWarning, setOpenWarning] = React.useState(false);
    const storage = firebase.storage();

    const handleClick = () => {
        setOpenAlert(true);
    };

    const handleClickWarning = () => {
        setOpenWarning(true);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
        return;
        }
        setOpenAlert(false);
    };

    const handleCloseWarning = (event, reason) => {
        if (reason === 'clickaway') {
        return;
        }
        setOpenWarning(false);
    };

    const assignmentBoxRefs = useRef([]);
    const finalExamBoxRefs = useRef([]);
    const assignmentDownloadBtnRefs = useRef([]);
    const finalExamDownloadBtnRefs = useRef([]);
    assignmentBoxRefs.current = [];
    finalExamBoxRefs.current = [];
    assignmentDownloadBtnRefs.current = [];
    finalExamDownloadBtnRefs.current = [];
    
    let param = useParams()
    let courseCode = param.classCourseId.split("+")[0]
    let className = param.classCourseId.split("+")[1]
    let activeClass = JSON.parse(localStorage.getItem('activeClass'))
    // console.log(activeClass);
    // console.log(courseCode);
    // console.log(className);

    const addToAssignmentBoxRefs = (el)=>{
        if(el && !assignmentBoxRefs.current.includes(el)){
            assignmentBoxRefs.current.push(el);
        }
    }
    
    const addToFinalExamBoxRefs = (el)=>{
        if(el && !finalExamBoxRefs.current.includes(el)){
            finalExamBoxRefs.current.push(el)
        }
    }
    const addToAssignmentDownloadBtnRefs = (el)=>{
        if(el && !assignmentDownloadBtnRefs.current.includes(el)){
            assignmentDownloadBtnRefs.current.push(el);
        }
    }
    
    const addToFinalExamDownloadBtnRefs = (el)=>{
        if(el && !finalExamDownloadBtnRefs.current.includes(el)){
            finalExamDownloadBtnRefs.current.push(el)
        }
    }

    var currentClass
    activeClass.forEach(c =>{
        if(c.ClassName === className && c.CourseCode === courseCode){
            currentClass = c;
            sessionStorage.setItem('currentClass', JSON.stringify(currentClass));
        }
    })
    let assignments = currentClass.ExamSchedule.assignments
    let finalExams = currentClass.ExamSchedule.finalExams

    var asgList = []
    var finalExamList = []
    var asgUploadBox = []
    var finalExamUploadBox = []

    useEffect(()=>{
        if(uploaded){
            handleClick();
            for(var i=1; i <= assignments.length; i++){
                if(uploaded.Type === "assignment"+i){
                    assignmentBoxRefs.current[i-1].innerHTML = uploaded.File.name
                }
            }
            for(var i=1; i <= finalExams.length; i++){
                if(uploaded.Type === "finalExam"+i){
                    finalExamBoxRefs.current[i-1].innerHTML = uploaded.File.name
                }
            }
        }
        else if(uploaded == false){
            handleClickWarning();
            setUploaded();
        }
    }, [uploaded])

    let storageDirectory = '/2110/' + currentClass.CourseCode + '/' + currentClass.ClassName + '/'
    function getAssignmentUploaded(caseType){
        storage.ref()
        .child(`${storageDirectory}/${caseType}/case/`).listAll()
        .then(res => {
            res.items.forEach(item =>{
                // console.log(item.getMetadata());
                let temp = {
                    'Type': caseType,
                    'Name': item.name,
                    'File': item
                }
                for(var i=1; i <= assignments.length; i++){
                    if(caseType === "assignment"+i && assignmentBoxRefs.current[i-1]){
                        assignmentBoxRefs.current[i-1].innerHTML = temp.File.name
                        assignmentDownloadBtnRefs.current[i-1].className = "bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    }
                }
            })
        })
        .catch(err => {
            console.log(err);
        })
    }

    function getFinalExamUploaded(caseType){
        storage.ref()
        .child(`${storageDirectory}/${caseType}/case/`).listAll()
        .then(res => {
            res.items.forEach(item =>{
                let temp = {
                    'Type': caseType,
                    'Name': item.name,
                    'File': item
                }
                for(var i=1; i <= assignments.length; i++){
                    if(caseType === "finalExam"+i && finalExamBoxRefs.current[i-1]){
                        finalExamBoxRefs.current[i-1].innerHTML = temp.File.name
                        finalExamDownloadBtnRefs.current[i-1].className = "bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    }
                }
            })
        })
        .catch(err => {
            console.log(err);
        })
    }

    function initAssignmentList(){
        if(assignments === null) assignments = [];
        let bgColor = "white"
        for (var i = 1; i <= assignments.length; i++) {
            if (i%2 == 0) bgColor = "gray-50"
            asgList.push(
                <div className={`bg-${bgColor} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`} key={i}>
                    <dt className="text-sm font-medium text-gray-500">Assignment {i}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{(new Date(assignments[i-1].Date)).toDateString()}</dd>
                </div>
            );
        }
        if(assignments.length === 0){
            asgList.push(
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" key={0}>
                    <dt className="text-sm font-medium text-gray-500">Assignment</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">-</dd>
                </div>
            );
        }
    }

    function initAssignmentList(){
        if(assignments === null) assignments = [];
        for (var i = 1; i <= assignments.length; i++) {
            asgList.push(
                <div className={`bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`} key={i}>
                    <dt className="text-sm font-medium text-gray-500">Assignment {i}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{(new Date(assignments[i-1].Date)).toDateString()}</dd>
                </div>
            );
        }
        if(assignments.length === 0){
            asgList.push(
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" key={0}>
                    <dt className="text-sm font-medium text-gray-500">Assignment</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">-</dd>
                </div>
            );
        }
    }
    
    function initFinalExamList(){
        if(finalExams == []) return;
        for (let i = 1; i <= finalExams.length; i++) {
            finalExamList.push(
                <div className={`bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`} key={i}>
                    <dt className="text-sm font-medium text-gray-500">Final Exam {i}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{(new Date(finalExams[i-1].Date)).toDateString()}</dd>
                </div>
            );
        }
        if(finalExams.length === 0){
            finalExamList.push(
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" key={0}>
                    <dt className="text-sm font-medium text-gray-500">Final Exam</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">-</dd>
                </div>
            );
        }
    }

    function setAssignmentDirectory(e){
        let id = e.target.id;
        let temp = {
            'Type':'assignment'+id,
            'Name':'Assignment Case '+id
        }
        setCaseType(temp);
        setFormOpen(true);
    }

    function downloadAssignment(e){
        if(e.target.className.includes('gray')){
            return;
        }
        let id = e.target.id;
        let type = 'assignment'+id
        document.body.style.cursor = "progress";
        storage.ref().child(`${storageDirectory}/${type}/case/`).listAll().then(res => {
            res.items.forEach(item =>{
                item.getDownloadURL().then(url => {
                    console.log(url);
                    fetch('/download-exam-case',{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(url)
                    }).then(res => res.json()).then(data=>{
                        console.log(data);
                        document.body.style.cursor = "default";
                    })
                })
            })
        })
        .catch(err => {
            console.log(err);
            document.body.style.cursor = "default";
        })
    }
    function downloadFinalExam(e){
        if(e.target.className.includes('gray')){
            return;
        }
        let id = e.target.id;
        let type = 'finalExam'
        document.body.style.cursor = "progress";
        storage.ref().child(`${storageDirectory}/${type}/case/`).listAll().then(res => {
            res.items.forEach(item =>{
                item.getDownloadURL().then(url => {
                    console.log(url);
                    fetch('/download-exam-case',{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(url)
                    }).then(res => res.json()).then(data=>{
                        console.log(data);
                        document.body.style.cursor = "default";
                    })
                })
            })
        })
        .catch(err => {
            console.log(err);
            document.body.style.cursor = "default";
        })
    }

    function setFinalExamDirectory(e){
        let id = e.target.id;
        let temp = {
            'Type':'finalExam'+id,
            'Name':'Final Exam Case '+id
        }
        setCaseType(temp);
        setFormOpen(true);
    }

    function initAsignmentUploadBox(){
        if(assignments === null) assignments = [];
        for (var i = 1; i <= assignments.length; i++) {
            asgUploadBox.push(
                <div className={`bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`} key={i}>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">Assignment Case {i}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                                <PaperClipIcon className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                                <span className="ml-2 flex-1 w-0 truncate" ref={addToAssignmentBoxRefs}>
                                    Empty
                                </span>
                            </div>
                            <div className="ml-4 flex-shrink-0 flex space-x-4">
                                <p className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500" id={i} onClick={setAssignmentDirectory}>
                                    Upload
                                </p>
                            <span className="text-gray-300" aria-hidden="true">
                            |
                            </span>
                                <button
                                type="button"
                                id = {i}
                                onClick={downloadAssignment}
                                ref={addToAssignmentDownloadBtnRefs}
                                className="cursor-not-allowed bg-white rounded-md font-medium text-gray-600"
                                >
                                Download
                                </button>
                            </div>
                        </li>
                    </ul>
                    </dd>
                </div>
            );
            getAssignmentUploaded('assignment'+i)
        }
    }

    function initFinalExamUploadBox(){
        if(finalExams == []) return;
        for (var i = 1; i <= finalExams.length; i++) {
            finalExamList.push(
                <div className={`bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`} key={i}>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">Final Exam Case {i}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                                <PaperClipIcon className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                                <span className="ml-2 flex-1 w-0 truncate" ref={addToFinalExamBoxRefs}>
                                    Empty
                                </span>
                            </div>
                            <div className="ml-4 flex-shrink-0 flex space-x-4">
                                <p className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500" id={i} onClick={setFinalExamDirectory}>
                                    Upload
                                </p>
                                <span className="text-gray-300" aria-hidden="true">
                                |
                                </span>
                                    <button
                                    type="button"
                                    id={i}
                                    onClick={downloadFinalExam}
                                    ref={addToFinalExamDownloadBtnRefs}
                                    className="cursor-not-allowed bg-white rounded-md font-medium text-gray-600"
                                    >
                                    Download
                                    </button>
                            </div>
                        </li>
                    </ul>
                    </dd>
                </div>
            );
            getFinalExamUploaded('finalExam'+i);
        }
    }

    initAssignmentList();
    initFinalExamList();
    initAsignmentUploadBox();
    initFinalExamUploadBox();

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{currentClass ? `${currentClass.CourseName}` : ''}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">{currentClass ? `${currentClass.CourseCode}` : ''}</p>
            </div>
            <div className="border-t border-gray-200">
                <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Course Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currentClass ? `${currentClass.CourseName}` : ''}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Course Code</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currentClass ? `${currentClass.CourseCode}` : ''}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Class Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currentClass ? `${currentClass.ClassName}` : ''}</dd>
                </div>
                <div>
                    {/* {
                        currentClass.ExamSchedule.assignments?.map(asg =>{
                            console.log(asg);
                            <AssignmentBox assignment = {currentClass.ExamSchedule.assignments}/>
                        })
                    } */}
                    {asgList}
                </div>
                <div>
                    {finalExamList}
                </div>
                <div>
                    {asgUploadBox}
                    {finalExamUploadBox}
                </div>
                </dl>
            </div>

            <div className="relative px-4 py-5">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                    <span className="px-3 bg-white text-lg font-medium text-gray-900">{currentClass.StudentList.length} students</span>
                </div>
            </div>
            
            <StudentsBox currentClass = {currentClass}/>

            {isFormOpen && <UploadForm formOpen={setFormOpen} setUploaded={setUploaded} classData={currentClass} caseType={caseType}/>}
            <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                {uploaded && `${uploaded.File.name} is Uploaded Successfully !`}
                </Alert>
            </Snackbar>

            <Snackbar open={openWarning} autoHideDuration={6000} onClose={handleCloseWarning}>
                <Alert onClose={handleCloseWarning} severity="warning" sx={{ width: '100%' }}>
                Choose a file to upload !
                </Alert>
            </Snackbar>
            {/* <Alert severity="error">This is an error message!</Alert>
            <Alert severity="warning">This is a warning message!</Alert>
            <Alert severity="info">This is an information message!</Alert>
            <Alert severity="success">This is a success message!</Alert> */}
        </div>
    );
};

export default ClassDescription
