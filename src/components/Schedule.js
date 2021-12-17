import React from 'react'
import { MailIcon, PhoneIcon } from '@heroicons/react/solid'
import {Link} from "react-router-dom";

const Schedule = (props) => {

  let classCourseId = props.classData.CourseCode + '+' + props.classData.ClassName
  const classData = [
      {
        key: props.classData.Id,
        courseCode: props.classData.CourseCode,
        courseName: props.classData.CourseName,
        name: props.classData.Name,
        className: props.classData.ClassName,
        courseOutlineId: props.classData.CourseOutlineId,
        students: props.classData.StudentList,
        examSchedule: props.classData.ExamSchedule,
      },
    ]

  return (
    <Link to={`/home/schedule/${classCourseId}`}>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-3">
        {classData?.map((data) => (
          <li key={data.key} className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
            <div className="w-full flex items-center justify-between p-6 space-x-6">
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="text-gray-900 text-sm font-medium truncate">{data.name}</h3>
                </div>
                <p className="mt-1 text-gray-500 text-sm truncate">{data.className}</p>
              </div>
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Link>
  )
}

export default Schedule
