import React from 'react';
import { CheckCircleIcon, ChevronRightIcon, MailIcon } from '@heroicons/react/solid'
import { IdentificationIcon }  from '@heroicons/react/outline'
import { useEffect,Fragment, useState } from 'react'

const StudentsBox = (props) => {

    const [studentList, setStudentList] = useState([])
  let students = props.currentClass.StudentList
  let currentClass = props.currentClass
//   global.CurrentClass = currentClass;
  let baseUrl = currentClass.CourseCode+'+'+currentClass.ClassName
  let imgPlaceholder = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'

    useEffect(() => {
        students.forEach(student => {
            fetch("https://laboratory.binus.ac.id/lapi/api/Account/GetThumbnail?id=" + student.PictureId).then(res => res.blob()
                ).then(data => {
                    const imageObjectURL = URL.createObjectURL(data)
                    let temp = {
                        imageUrl: imageObjectURL,
                        data: student
                    }
                    setStudentList(studentList => [...studentList, temp])
                })
        })
    }, [])

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {studentList?.sort((a, b) =>a.data.Name.localeCompare(b.data.Name))
                .map((student) => (
                <li key={student.data.Number}>
                    <a href={` ${baseUrl}/${student.data.Number} `} className="block hover:bg-gray-50">
                    <div className="flex items-center px-4 py-4 sm:px-6">
                        <div className="min-w-0 flex-1 flex items-center">
                        <div className="flex-shrink-0">
                            <img className="h-12 w-12 object-cover rounded-full" src={student.imageUrl} alt="Profile Picture" />
                        </div>
                        <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                            <div>
                            <p className="text-sm font-medium text-indigo-600 truncate">{student.data.Name}</p>
                            <p className="mt-2 flex items-center text-sm text-gray-500">
                                <IdentificationIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                <span className="truncate">{student.data.Number}</span>
                            </p>
                            </div>
                            <div className="hidden md:block">
                            <div>
                                <p className="text-sm text-gray-900">
                                Born on <time dateTime={student.BirthDate}>{(new Date(student.data.BirthDate)).toDateString()}</time>
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500">
                                <CheckCircleIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" aria-hidden="true" />
                                Present
                                </p>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                    </div>
                    </a>
                </li>
                ))}
            </ul>
        </div>
    );
};

export default StudentsBox;