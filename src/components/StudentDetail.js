import React from 'react';
import { useParams } from "react-router-dom";
import { Fragment, useState, useEffect } from 'react'
import {
    ArrowNarrowLeftIcon,
    CheckIcon,
    HomeIcon,
    PaperClipIcon,
    QuestionMarkCircleIcon,
    SearchIcon,
    ThumbUpIcon,
    UserIcon,
} from '@heroicons/react/solid'
import firebase from '../firebase'
const cors = require('cors')

const StudentDetail = () => {

    let currentClass = JSON.parse(sessionStorage.getItem('currentClass'));
    const params = useParams()
    const currentTime = new Date();
    const storage = firebase.storage();
    let activeExam = null
    let studentNumber = params.studentNumber
    let student

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

    function getStudentLog(){
        let storageDirectory = '/2110/' + 'COMP6232001' + '/' + 'BB04' + '/'
        storage.ref()
        .child(`${storageDirectory}/assignment1/log/normal_log/`).listAll()
        .then(res => {
            res.items.forEach(item =>{
                // item.getDownloadURL().then(url =>{
                //     console.log(url);
                // })
                item.getDownloadURL().then(url =>{
                    console.log(url);
                    // fetch(url).then(data=>{
                    //     data.text().then(t=>{
                    //         console.log(t);
                    //     })
                    // })
                })
            })
        })
        .catch(err => {
            console.log(err);
        })
    }

    getStudentLog();

    const eventTypes = {
        applied: { icon: UserIcon, bgColorClass: 'bg-gray-400' },
        advanced: { icon: ThumbUpIcon, bgColorClass: 'bg-blue-500' },
        completed: { icon: CheckIcon, bgColorClass: 'bg-green-500' },
      }
    const timeline = [
        {
          id: 1,
          type: eventTypes.applied,
          content: 'Applied to',
          target: 'Front End Developer',
          date: 'Sep 20',
          datetime: '2020-09-20',
        },
        {
          id: 2,
          type: eventTypes.advanced,
          content: 'Advanced to phone screening by',
          target: 'Bethany Blake',
          date: 'Sep 22',
          datetime: '2020-09-22',
        },
        {
          id: 3,
          type: eventTypes.completed,
          content: 'Completed phone screening with',
          target: 'Martha Gardner',
          date: 'Sep 28',
          datetime: '2020-09-28',
        },
        {
          id: 4,
          type: eventTypes.advanced,
          content: 'Advanced to interview by',
          target: 'Bethany Blake',
          date: 'Sep 30',
          datetime: '2020-09-30',
        },
        {
          id: 5,
          type: eventTypes.completed,
          content: 'Completed interview with',
          target: 'Katherine Snyder',
          date: 'Oct 4',
          datetime: '2020-10-04',
        },
      ]

    return (
        <div className="min-h-screen bg-gray-100">
            <main className="py-10">
                {/* Page header */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
                <div className="flex items-center space-x-5">
                    <div className="flex-shrink-0">
                    <div className="relative">
                        <img
                        className="h-16 w-16 rounded-full"
                        src="https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80"
                        alt=""
                        />
                        <span className="absolute inset-0 shadow-inner rounded-full" aria-hidden="true" />
                    </div>
                    </div>
                    <div>
                    <h1 className="text-2xl font-bold text-gray-900">{student.Name}</h1>
                    <p className="text-sm font-medium text-gray-500">
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
                    Advance to offer
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
                            <dt className="text-sm font-medium text-gray-500">About</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat.
                                Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia
                                proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu.
                            </dd>
                            </div>
                            
                        </dl>
                        </div>
                    </div>
                    </section>
                    <section aria-labelledby="timeline-title" className="lg:col-start-3 lg:col-span-1">
                        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
                        <h2 id="timeline-title" className="text-lg font-medium text-gray-900">
                            Student Log
                        </h2>

                        {/* Activity Feed */}
                        <div className="mt-6 flow-root">
                            <ul className="-mb-8">
                            {timeline.map((item, itemIdx) => (
                                <li key={item.id}>
                                <div className="relative pb-8">
                                    {itemIdx !== timeline.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                    ) : null}
                                    <div className="relative flex space-x-3">
                                    <div>
                                        <span
                                        className={classNames(
                                            item.type.bgColorClass,
                                            'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
                                        )}
                                        >
                                        <item.type.icon className="w-5 h-5 text-white" aria-hidden="true" />
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                        <p className="text-sm text-gray-500">
                                            {item.content}{' '}
                                            <a href="#" className="font-medium text-gray-900">
                                            {item.target}
                                            </a>
                                        </p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                        <time dateTime={item.datetime}>{item.date}</time>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </li>
                            ))}
                            </ul>
                        </div>
                        <div className="mt-6 flex flex-col justify-stretch">
                            <button
                            type="button"
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                            Advance to offer
                            </button>
                        </div>
                        </div>
                    </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDetail;