import React from 'react';
import { useParams } from "react-router-dom";
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
    ArrowNarrowLeftIcon,
    CheckIcon,
    HomeIcon,
    PaperClipIcon,
    QuestionMarkCircleIcon,
    SearchIcon,
    ThumbUpIcon,
    UserIcon,
    InformationCircleIcon,
    ExclamationIcon,
    XIcon,
    LinkIcon
} from '@heroicons/react/solid'
import Loader from "react-loader-spinner";
import firebase from '../firebase';
import { v4 as uuidv4 } from 'uuid';

const StudentDetail = () => {

    let currentClass = JSON.parse(sessionStorage.getItem('currentClass'));
    const tabs = [
        { name: 'All', href: '#', current: true },
        { name: 'Assignment 1', href: '#', current: false },
        { name: 'Assignment 2', href: '#', current: false },
        { name: 'Final Exam', href: '#', current: false },
    ]
    const [studentLog, setStudentLog] = useState([])
    const [pictureId, setPictureId] = useState()
    const [choosenLog, setChoosenLog] = useState([])
    const [backupLink, setBackupLink] = useState([])
    const [isLogViewable, setIsLogViewable] = useState(false);
    const [logList, setLogList] = useState([])
    const [allLogs, setAllLogs] = useState([])
    const [isFetchingLog, setIsFetchingLog] = useState(true)
    const [open, setOpen] = useState(false)
    const [examTabs, setExamTabs] = useState(tabs)
    const [logModalIcon, setLogModalIcon] = useState()
    const params = useParams()
    const currentTime = new Date();
    const storage = firebase.storage();
    let activeExam = null
    let studentNumber = params.studentNumber
    let student

    const eventTypes = {
        applied: { icon: UserIcon, bgColorClass: 'bg-gray-400' },
        advanced: { icon: ThumbUpIcon, bgColorClass: 'bg-blue-500' },
        completed: { icon: CheckIcon, bgColorClass: 'bg-green-500' },
        information: { icon: InformationCircleIcon, bgColorClass: 'bg-gray-500' },
        suspected: { icon: ExclamationIcon, bgColorClass: 'bg-yellow-500' },
    }
    
    function changeExamTypeDropDown(e){
        changeExamType(JSON.parse(e.target.value))
    }

    function changeExamType(currTab){
        let examType = ""
        tabs.forEach(tab => {
            if(tab.name === currTab.name){
                tab.current = true;
                examType = tab.name
            }else{
                tab.current = false
            }
        })
        setExamTabs(tabs)

        let allLog = allLogs
        if(examType === "All"){
            setLogList(allLogs)
        }else{
            let res = allLog.filter(a => {
                return a.examType === examType
            })
            setLogList(res)
        }
    }

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    const examTypes = {
        'assignment1': 'Assignment 1',
        'assignment2': 'Assignment 2',
        'finalExam': 'Final Exam'
    };

    function getCurrentExam(){
        if(currentClass.ExamSchedule.assignments !== null){
            let i = 1;
            currentClass.ExamSchedule.assignments.forEach(assignment => {
                if(currentTime <= new Date(assignment.Date)){
                    let temp = {
                        ExamTypeId: 'assignment'+i,
                        ExamType: 'Assignment '+i,
                        ExamDetail: assignment 
                    }
                    activeExam = temp;
                }
                i++;
            })
        }else if(currentClass.ExamSchedule.finalExams.length > 0){
            let i = 1;
            currentClass.ExamSchedule.finalExams.forEach(finalExam => {
                if(currentTime <= new Date(finalExam.Date)){
                    let temp = {
                        ExamTypeId: 'finalExam'+i,
                        ExamType: 'Final Exam '+i,
                        ExamDetail: finalExam 
                    }
                    activeExam = temp;
                }
                i++;
            })
        }
    }

    getCurrentExam();

    currentClass.StudentList.forEach(s => {
        if(s.Number === studentNumber){
            student = s
        }
    })

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }
    
    function getDateAndTime(log){
        let name = log.name
        name = name.split(' ')
        let date = name[0].split('_')[2]
        date = new Date(date)
        let time = name[1].split('.')[0]
        time = time.split('_')
        date.setHours(time[0], time[1], time[2])
        let temp = {
            date: date,
            time: date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
        }
        // console.log(temp.date.toLocaleTimeString());
        return temp;
    }

    useEffect(() => {
        let storageDirectory = '/2110/' + currentClass.CourseCode + '/' + currentClass.ClassName + '/'

        fetch("https://laboratory.binus.ac.id/lapi/api/Account/GetThumbnail?id=" + student.PictureId).then(res => res.blob()
        ).then(data => {
            const imageObjectURL = URL.createObjectURL(data)
            setPictureId(imageObjectURL)
        })

        let key = 0;
        let isLogExists = false;
        let logTemp = 0;
        storage.ref(`${storageDirectory}`).listAll().then((res) => {
            if(res.prefixes.length === 0){
                setIsFetchingLog(false);
            }
            res.prefixes.forEach((exam) => {
                storage.ref()
                .child(`${storageDirectory}/${exam.name}/log/normal_log/`).listAll()
                .then(res => {
                    res.items.forEach(item =>{
                        if(item.name.includes(student.Number)){
                            isLogExists = true;
                            let temp = {
                                id: uuidv4(),
                                content: item.name,
                                type: eventTypes.information,
                                examType: examTypes[exam.name],
                                logType: 'Normal Log',
                                dateTime: getDateAndTime(item),
                                detail: item
                            }
                            setLogList(logList => [...logList, temp])
                            setAllLogs(allLogs => [...allLogs, temp])
                        }
                        if(!isLogExists){
                            setIsFetchingLog(false)
                        }
                        item.getDownloadURL().then(url =>{
                            if(item.name.includes(student.Number)){
                                setIsFetchingLog(true)
                                fetch('/get-student-log',{
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json'
                                    },
                                    body: JSON.stringify(url)
                                }).then(res => res.json()).then(data=>{
                                    setIsFetchingLog(false)
                                    setIsLogViewable(true)
                                    data.forEach(appName =>{
                                        let temp = {
                                            id: uuidv4(),
                                            fileName: item.name,
                                            content: appName,
                                            type: eventTypes.information,
                                            examType: examTypes[exam.name],
                                            logType: 'Normal Log',
                                            url: url
                                        }
                                        setStudentLog(studentLog => [...studentLog, temp])
                                        key+=1;
                                    })
                                })
                            }
                        })
                    })
                })
                .catch(err => {
                    console.log(err);
                })
                storage.ref()
                .child(`${storageDirectory}/${exam.name}/log/sus_log/`).listAll()
                .then(res => {
                    if(res.prefixes.length === 0){
                        setIsFetchingLog(false);
                    }
                    res.items.forEach(item =>{
                        if(item.name.includes(student.Number)){
                            isLogExists = true;
                            let temp = {
                                id: uuidv4(),
                                content: item.name,
                                type: eventTypes.suspected,
                                examType: examTypes[exam.name],
                                logType: 'Suspicious Log',
                                dateTime: getDateAndTime(item),
                                detail: item
                            }
                            setLogList(logList => [...logList, temp])
                            setAllLogs(allLogs => [...allLogs, temp])
                        }
                        if(!isLogExists){
                            setIsFetchingLog(false)
                        }
                        item.getDownloadURL().then(url =>{
                            if(item.name.includes(student.Number)){
                                setIsFetchingLog(true)
                                fetch('/get-student-log',{
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json'
                                    },
                                    body: JSON.stringify(url)
                                }).then(res => res.json()).then(data=>{
                                    setIsFetchingLog(false)
                                    setIsLogViewable(true)
                                    data.forEach(appName =>{
                                        let temp = {
                                            id: uuidv4(),
                                            fileName: item.name,
                                            content: appName,
                                            type: eventTypes.suspected,
                                            examType: examTypes[exam.name],
                                            logType: 'Suspicious Log',
                                            url: url
                                        }
                                        setStudentLog(studentLog => [...studentLog, temp])
                                        key+=1;
                                    })
                                })
                            }
                        })
                    })
                })
                .catch(err => {
                    console.log(err);
                })
            })
        })

        fetch("/get-student-backup-answer",{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(currentClass.CourseCode+' '+currentClass.ClassName+' '+student.Number)
        }).then(res => res.json()).then(data=>{
            setBackupLink(data);
        })
    }, [])

    function toggleLogModal(appLog){
        setChoosenLog([])
        setLogModalIcon(appLog.type)
        setOpen(true);
        let idx = 1;

        studentLog.forEach(log =>{
            if(appLog.content == log.fileName){
                let temp = {
                    key: idx,
                    content: log.content
                }
                idx++;
                setChoosenLog(choosenLog => [...choosenLog, temp])
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <main className="py-10">
                {/* Page header */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
                <div className="flex items-center space-x-5">
                    <div className="flex-shrink-0">
                    <div className="relative">
                        <img
                        className="h-20 w-20 object-cover rounded-full drop-shadow-md"
                        src={pictureId}
                        alt=""
                        />
                        <span className="absolute inset-0 shadow-inner rounded-full" aria-hidden="true" />
                    </div>
                    </div>
                    <div>
                    <h1 className="text-2xl font-bold text-gray-900">{student.Name}</h1>
                    <p className="text-base font-medium text-gray-500">
                        {student.Number}{' '}
                        <a href="#" className="text-gray-900">
                        
                        </a>{' '}
                        <time dateTime="2020-08-25"></time>
                    </p>
                    </div>
                </div>
                <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
                    <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                    >
                    Disqualify
                    </button>
                    <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                    >
                    Notify
                    </button>
                </div>
                </div>

                <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2">
                <div className="space-y-6 lg:col-start-1 lg:col-span-2">
                    {/* Description list*/}
                    <section aria-labelledby="applicant-information-title">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                        <h2 id="applicant-information-title" className="text-lg leading-6 font-medium text-gray-900">
                            Student Information
                        </h2>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Student details and information.</p>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                            <dd className="mt-1 text-sm text-gray-900">{student.Name}</dd>
                            </div>
                            <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Student Number</dt>
                            <dd className="mt-1 text-sm text-gray-900">{student.Number}</dd>
                            </div>
                            <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Upcoming Exam</dt>
                            <dd className="mt-1 text-sm text-gray-900">{activeExam ? activeExam.ExamType : '-'}</dd>
                            </div>
                            <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">{activeExam ? `${activeExam.ExamType} Exam Date` : 'Exam Date'}</dt>
                            <dd className="mt-1 text-sm text-gray-900">{activeExam ? new Date(activeExam.ExamDetail.Date).toDateString() : '-'}</dd>
                            </div>
                            <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Answer Backup Link</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                <div className="sm:col-span-2">
                                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                {backupLink.length > 0 ? 
                                    backupLink?.map(link => (
                                        <li key={uuidv4()} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                        <div className="w-0 flex-1 flex items-center">
                                            <LinkIcon className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                                            <a href={link.backup_link} target="_blank" className="ml-2 flex-1 w-0 truncate hover:text-indigo-600">
                                                {link.backup_link}
                                            </a>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <p className="text-sm font-medium text-gray-500">{examTypes[link.exam_type]}</p>
                                        </div>
                                        </li>
                                    ))
                                    :
                                    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                    <div className="w-0 flex-1 flex items-center">
                                        <LinkIcon className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                                        <span className="ml-2 flex-1 w-0 truncate text-gray-500">Empty</span>
                                    </div>
                                    </li>
                                }
                                </ul>
                                </div>
                            </dd>
                            </div>
                            
                        </dl>
                        </div>
                    </div>
                    </section>

                    <div>
                        <div className="sm:hidden">
                            <label htmlFor="tabs" className="sr-only">
                            Select a tab
                            </label>
                            <select
                            id="tabs"
                            name="tabs"
                            className="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                            defaultValue={tabs.find((tab) => tab.current).name}
                            onChange={changeExamTypeDropDown}
                            >
                            {examTabs.map((tab) => (
                                <option key={tab.name} value={JSON.stringify(tab)}>{tab.name}</option>
                            ))}
                            </select>
                        </div>
                        <div className="hidden sm:block">
                            <div className="border-b border-gray-200">
                            <nav className="-mb-px flex" aria-label="Tabs">
                                {examTabs.map((tab) => (
                                <p
                                    key={tab.name}
                                    onClick={()=>changeExamType(tab)}
                                    className={classNames(
                                    tab.current
                                        ? 'border-indigo-500 text-indigo-600 cursor-pointer'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer',
                                    'w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm'
                                    )}
                                    aria-current={tab.current ? 'page' : undefined}
                                >
                                    {tab.name}
                                </p>
                                ))}
                            </nav>
                            </div>
                        </div>
                    </div>

                        {/* Activity Feed */}
                        <div className="flex flex-col">
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Log Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Date
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Time
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Type
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logList?.sort((a, b) => b.logType.localeCompare(a.logType))
                                    .map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                        <span
                                            className={classNames(
                                                log.type.bgColorClass,
                                                'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
                                            )}
                                            >
                                            <log.type.icon className="w-5 h-5 text-white" aria-hidden="true"/>
                                        </span>
                                            
                                            <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{log.content}</div>
                                            {/* <div className="text-sm text-gray-500">{log.content}</div> */}
                                            </div>
                                        </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{log.dateTime.date.toDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{log.dateTime.date.toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{log.examType}</div>
                                            <div className="text-sm text-gray-500">{log.logType}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {isLogViewable && 
                                            <span className="cursor-pointer text-indigo-600 hover:text-indigo-900" onClick={() => toggleLogModal(log)}>
                                                View
                                            </span>
                                        }
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>
                            </div>
                        </div>
                        </div>
                        {
                            isFetchingLog ?
                                <div className="mt-6 flex flex-col justify-stretch items-center">
                                    <Loader
                                    type="ThreeDots"
                                    color="#0C99F2"
                                    height={40}
                                    width={40}
                                    radius={5000000}
                                    />
                                </div>
                            : studentLog.length <= 0 ?
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-2 bg-gray-100 rounded-full text-sm text-gray-500">Student log is empty</span>
                                </div>
                            </div>
                            : ''
                        }
                    </div>
                </div>
            </main>

             <Transition.Root show={open} as={Fragment}>
             <Dialog as="div" static className="fixed z-10 inset-0 overflow-y-auto" open={open} onClose={setOpen}>
                 <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                 <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                 {/* This element is to trick the browser into centering the modal contents. */}
                 <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                     &#8203;
                 </span>
                 <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                        <button
                        type="button"
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => setOpen(false)}
                        >
                        <span className="sr-only">Close</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="sm:flex sm:items-start">
                        {/* <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <InformationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div> */}
                        {logModalIcon && 
                            <span
                                className={classNames(
                                    logModalIcon?.bgColorClass,
                                    'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
                                )}
                                >
                                <logModalIcon.icon className="w-5 h-5 text-white" aria-hidden="true"/>
                            </span>
                        }
                        <div className="w-10/12 mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                Application Log
                            </Dialog.Title>
                            <div className="mt-1">
                            <ul className="divide-y divide-gray-200">
                                {choosenLog?.map((log) => (
                                    <li key={log.key} className="py-4 flex">
                                    <p className="text-sm text-gray-500">{log.key}</p>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{log.content}</p>
                                    </div>
                                    </li>
                                ))}
                            </ul>
                                {/* {choosenLog?.map((log) => (
                                        <p key={log.key} className="text-sm text-gray-500">
                                            {log.content}
                                        </p>
                                ))} */}
                            </div>
                        </div>
                    </div>
                    {/* <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => setOpen(false)}
                        >
                        Deactivate
                        </button>
                        <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={() => setOpen(false)}
                        >
                        Cancel
                        </button>
                    </div> */}
                    </div>
                </Transition.Child>
                </div>
            </Dialog>
            </Transition.Root>
        </div>
    );
};

export default StudentDetail;