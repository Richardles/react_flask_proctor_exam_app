import React from 'react'
import { Fragment, useState, useEffect, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Disclosure, Menu } from '@headlessui/react'
// import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import { Audio,Triangle } from  'react-loader-spinner'
import Clock from 'react-live-clock'
import {
  FolderIcon,
  HomeIcon,
  MenuIcon,
  UsersIcon,
  XIcon,
  BellIcon,
  LogoutIcon,
  CheckIcon
} from '@heroicons/react/outline'
import { DotsVerticalIcon } from '@heroicons/react/solid'
import Schedule from '../components/Schedule'
import CaseUpload from '../components/CaseUpload'
import ClassDescription from '../components/ClassDescription'
import StudentDetail from '../components/StudentDetail'
import firebase from '../firebase'

const Home = (data) => {

  var pageX = screen.width;
  var pageY = screen.width;

  function _onMouseMove(e) {
    let x = e.screenX
    let y = e.screenY
    
    //verticalAxis
    let yAxis = (pageY/2-y)/pageY*300; 
    //horizontalAxis
    x = x / -pageX;
    let xAxis = -x * 100 - 100;
    
    if(document.querySelector('.box__ghost-eyes')){
      document.querySelector('.box__ghost-eyes').style.transform = 'translate('+ xAxis +'%,-'+ yAxis +'%)'

    }
    // $('.box__ghost-eyes').css({ 'transform': 'translate('+ xAxis +'%,-'+ yAxis +'%)' }); 

    //console.log('X: ' + xAxis);
  }

    const navigation = [
        { name: 'Schedule', href: '/home/schedule', icon: HomeIcon, current: true },
        { name: 'Class View', href: '/home/class_view', icon: FolderIcon, current: false },
    ]

    const tabs = [
      { name: 'All', href: '#', current: true },
      // { name: 'Online', href: '#', current: false },
      // { name: 'Offline', href: '#', current: false },
    ]

    const [user, setUser] = useState({});
    const [classTransactionDetail, setClassTransaction] = useState([]);
    const [isFetchingClassTransaction, setFetchingClassTransaction] = useState(true);
    const [showNotification, setShowNotification] = useState(false)
    const [isNewNotif, setIsNewNotif] = useState(false)
    const [notificationList, setNotificationList] = useState([])
    const [showNotificationList, setShowNotificationList] = useState(false)
    const [notificationPopUpData, setNotificationPopUpData] = useState()
    const [proctorPicture, setProctorPicture] = useState()
    const [signOutModalOpen, setSignOutModalOpen] = useState(false)

    const cancelButtonRef = useRef()
    let currentPage = ''
    let viewLayout = 'py-4'
    let activeClass;

    function classNames(...classes) {
      return classes.filter(Boolean).join(' ')
    }

    // const query = new URLSearchParams(useLocation().search);
    // const classCourseId = query.get("q");

    function getNotification(){
      const ref = firebase.database().ref('2110').child('notification')
      
      activeClass = JSON.parse(localStorage.getItem('activeClass'))
      let courseCodeList = []
      if(activeClass){
        activeClass.forEach(a => {
          if(!courseCodeList.includes(a.CourseCode)){
            courseCodeList.push(a.CourseCode)
          }
        })
      }

      ref.on("value",(snapshot)=>{
        setNotificationList([])
        snapshot.forEach(c => {
          if(courseCodeList.includes(c.key)){
            getLeaf(c)
            setIsNewNotif(true)
          }
        })
      })
    }

    function getLeaf(c){
      if(c.exists() && c.hasChildren()){
        c.forEach(child => {
          getLeaf(child)
        })
      }
      if(typeof c.val() === 'string'){
        let dateTime = c.ref.path.pieces_[6].split(' ')
        let time = dateTime[1].split('_')
        let date = new Date(dateTime[0])
        date.setHours(time[0], time[1], time[2])
        let student = getStudentData(c.ref.path.pieces_[5]);
        if(student){
          fetch("https://laboratory.binus.ac.id/lapi/api/Account/GetThumbnail?id=" + student.PictureId).then(res => res.blob())
            .then(data => {
                  const imageObjectURL = URL.createObjectURL(data)
                  let studentData = {
                      imageUrl: imageObjectURL,
                      data: student
                  }
                  let temp = {
                    path: c.ref.path.pieces_,
                    detail: {
                      courseCode: c.ref.path.pieces_[2],
                      className: c.ref.path.pieces_[3],
                      examType: c.ref.path.pieces_[4],
                      studentNumber: c.ref.path.pieces_[5],
                      dateTime: date,
                    },
                    student: studentData,
                    value: c.val()
                  }
                  setNotificationList(notificationList => [...notificationList, temp])
              })
        }
      }
    }

    function getStudentData(nim){
      for(let i = 0; i < activeClass.length; i++){
        for(let j = 0; j < activeClass[i].StudentList.length; j++){
          if(activeClass[i].StudentList[j].Number === nim){
            return activeClass[i].StudentList[j];
          }
        }
      }
    }

    function classNames(...classes) {
      return classes.filter(Boolean).join(' ')
    }

    function nav(){
      navigation.forEach(element => {
        element.current = false;
      });
      if(data.data === "schedule"){
        navigation[0].current = true;
        currentPage = navigation[0].name
        viewLayout = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 my-5"
      }else if(data.data === "manage class" || data.data === "student view"){
        navigation[1].current = true;
        currentPage = navigation[1].name
      }else if(data.data === "class view"){
        navigation[1].current = true;
        currentPage = navigation[1].name
        viewLayout = "py-4"
      }
    }
    nav();

    function clearStorage(){
      localStorage.clear()
      sessionStorage.clear()
    }

    useEffect(() => {
        fetch('/get-session').then(res => res.json()).then(data => {
          if(data === ""){
            window.location.href = "/"
          }
          setUser(data)
          fetch("https://laboratory.binus.ac.id/lapi/api/Account/GetThumbnail?id=" + data.PictureId).then(res => res.blob()).then(data => {
            const imageObjectURL = URL.createObjectURL(data)
            setProctorPicture(imageObjectURL)
          })
        })

        if(localStorage.getItem('activeClass') == null){
          console.log('active class is empty');
          fetch('/get-active-class').then(res => res.json()).then(data => {
            if(data === ""){
              window.location.href = "/"
            }
            setClassTransaction(data)
            setFetchingClassTransaction(false)
            getNotification()
            localStorage.setItem('activeClass', JSON.stringify(data))
          })
        }else{
          console.log('active class is not empty');
          setClassTransaction(JSON.parse(localStorage.getItem('activeClass')))
          setFetchingClassTransaction(false)
          getNotification()
        }
    }, [])

    const [sidebarOpen, setSidebarOpen] = useState(false)
    return (
        <div className="h-screen flex overflow-hidden bg-gray-100" onMouseMove={_onMouseMove}>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            static
            className="fixed inset-0 flex z-40 md:hidden"
            open={sidebarOpen}
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <nav className="mt-5 px-2 space-y-1">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                            'mr-4 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    ))}
                  </nav>
                </div>
                <div className="flex-shrink-0 flex bg-gray-700 p-4">
                <span className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div>
                      <Menu as="div" className="ml-4 relative flex-shrink-0">
                  {({ open }) => (
                    <>
                      <div>
                        <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-9 w-9 rounded-full object-cover"
                            src={proctorPicture}
                            alt=""
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        show={open}
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items
                          static
                          className="origin-bottom-left absolute bottom-9 left-0 mb-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="/"
                                onClick={() => clearStorage()}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                Sign out
                              </a>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{user.Name}</p>
                      <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200">{user.Username}</p>
                    </div>
                  </div>
                </span>
                </div>
              </div>
            </Transition.Child>
            <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex flex-col h-0 flex-1 bg-gray-800">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 bg-gray-800 space-y-1">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                          'mr-3 h-6 w-6'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex bg-gray-700 p-4">
                <span className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div>
                      <Menu as="div" className="ml-4 relative flex-shrink-0">
                  {({ open }) => (
                    <>
                      <div>
                        <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-9 w-9 rounded-full object-cover"
                            src={proctorPicture}
                            alt=""
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        show={open}
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items
                          static
                          className="origin-bottom-left absolute bottom-9 left-0 mb-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="/"
                                onClick={() => clearStorage()}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                Sign out
                              </a>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{user.Name}</p>
                      <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200">{user.Username}</p>
                    </div>
                  </div>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
            <button
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">

          <Disclosure as="nav" className="bg-white shadow">
            {({ open }) => (
              <>
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                  <div className="relative flex justify-between h-16">
                    <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                      <div className="flex-shrink-0 flex items-center">
                      <h1 className="text-2xl font-semibold text-gray-900 flex justify-center">{currentPage}</h1>
                      </div>
                      <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                      
                      </div>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                      <span className="inline-flex items-center px-3 py-0.5 mx-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 shadow-md shadow-black">
                        <svg className="-ml-1 mr-1.5 h-2 w-2 text-indigo-400" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx={4} cy={4} r={3} />
                        </svg>
                          <span><Clock format={'HH:mm:ss'} ticking={true} timezone={'Asia/Jakarta'}/> WIB</span>
                      </span>
                      <button
                      className="bg-white flex justify-center p-1 mx-2 rounded-full text-gray-400 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => {
                        setShowNotificationList(true)
                        getNotification()
                        setIsNewNotif(false)
                        }
                      }
                      >
                        <span className="sr-only">View notifications</span>
                        <span className="flex-shrink-0 inline-block relative">
                          <BellIcon className="h-6 w-6" aria-hidden="true"/>
                          {isNewNotif &&
                            <span
                              className={classNames(
                                'bg-red-500',
                                'absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white'
                              )}
                              aria-hidden="true"
                            />
                          }
                        </span>
                      </button>
                      <button
                      className="bg-white p-1 mx-2 rounded-full text-gray-400 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => {
                        setSignOutModalOpen(true)
                        }
                      }
                      >
                        <span className="sr-only">Log out</span>
                        <LogoutIcon className="h-6 w-6" aria-hidden="true"/>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Disclosure>

            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Replace with your content */}
                {isFetchingClassTransaction && 
                  <div className="flex h-screen justify-center">
                    <Loader
                        type="Rings"
                        color="#0C99F2"
                        height={80}
                        width={80}
                        radius={1000}
                      />
                  </div>
                }
                <ul className={viewLayout}>
                  {data.data === "schedule" ? 
                  isFetchingClassTransaction ? '' :
                  classTransactionDetail?.sort((a, b)=>a.CourseName.localeCompare(b.CourseName))
                  .map(detail=>{
                    return (
                        <Schedule classData={detail} key={detail.Id}/>
                    )
                  })
                  : data.data === "class view" ? 
                    <ClassDescription/>
                  : data.data === "manage class" ?
                  <div>
                    <div className="flex-col flex h-screen items-center">
                        {/* <Loader
                          type="ThreeDots"
                          color="#0C99F2"
                          secondaryColor="#20C4F8"
                          height={60}
                          width={60}
                          radius={5000000}
                        /> */}
                        <div className="box">
                          <div className="box__ghost">
                            <div className="symbol"></div>
                            <div className="symbol"></div>
                            <div className="symbol"></div>
                            <div className="symbol"></div>
                            <div className="symbol"></div>
                            <div className="symbol"></div>
                            
                            <div className="box__ghost-container">
                              <div className="box__ghost-eyes">
                                <div className="box__eye-left"></div>
                                <div className="box__eye-right"></div>
                              </div>
                              <div className="box__ghost-bottom">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                              </div>
                            </div>
                            <div className="box__ghost-shadow"></div>
                          </div>
                            <div className="box__description">
                              <div className="box__description-container">
                                <div className="box__description-title">Whoops!</div>
                                <div className="box__description-text">Go to 'Schedule' menu and pick a class</div>
                              </div>
                              
                            </div>
                        </div>

                    </div>
                  </div>
                  : data.data === "student view" ?
                    <StudentDetail/>
                  : "backup"
                  }
                </ul>
                {/* /End replace */}
              </div>
            </div>
          </main>
        </div>

        <>
          {/* Global notification live region, render this permanently at the end of the document */}
          <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
          >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
              {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
              <Transition
                show={showNotification}
                as={Fragment}
                enter="transform ease-out duration-300 transition"
                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5">
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <img
                          className="h-10 w-10 rounded-full"
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80"
                          alt=""
                        />
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{notificationPopUpData?.detail.studentNumber}</p>
                        <p className="mt-1 text-sm text-gray-500">{'Opened '+notificationPopUpData?.value}</p>
                        <div className="mt-4 flex">
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Open Student View
                          </button>
                          {/* <button
                            type="button"
                            className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Close
                          </button> */}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex">
                        <button
                          className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => {
                            setShowNotification(false)
                          }}
                        >
                          <span className="sr-only">Close</span>
                          <XIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </>

        <Transition.Root show={showNotificationList} as={Fragment}>
          <Dialog as="div" static className="fixed inset-0 overflow-hidden" open={showNotificationList} onClose={setShowNotificationList}>
            <div className="absolute inset-0 overflow-hidden">
              <Dialog.Overlay className="absolute inset-0" />

              <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <div className="w-screen max-w-md">
                    <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-medium text-gray-900">Notifications</Dialog.Title>
                          <div className="ml-3 h-7 flex items-center">
                            <button
                              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                              onClick={() => setShowNotificationList(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <XIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="border-b border-gray-200">
                        <div className="px-6">
                          <nav className="-mb-px flex space-x-6" x-descriptions="Tab component">
                            {tabs.map((tab) => (
                              <a
                                key={tab.name}
                                href={tab.href}
                                className={classNames(
                                  tab.current
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                  'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm'
                                )}
                              >
                                {tab.name}
                              </a>
                            ))}
                          </nav>
                        </div>
                      </div>
                      <ul className="divide-y divide-gray-200 overflow-y-auto">
                        {notificationList.sort((a, b)=>a.student.data.Name.localeCompare(b.student.data.Name))
                        .map((log) => (
                          <li key={log.path} className="px-6 py-5 relative">
                            <div className="group flex justify-between items-center">
                              <a href={` http://localhost:3000/home/schedule/${log.detail.courseCode}+${log.detail.className}/${log.student.data.Number} `} className="-m-1 p-1 block">
                                <div className="absolute inset-0 group-hover:bg-gray-50" aria-hidden="true" />
                                <div className="flex-1 flex items-center min-w-0 relative">
                                  <span className="flex-shrink-0 inline-block relative">
                                    <img className="h-10 w-10 object-cover rounded-full" src={log.student.imageUrl} alt="" />
                                    {/* <span
                                      className={classNames(
                                        'online' === 'online' ? 'bg-green-400' : 'bg-red-400',
                                        'absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white'
                                      )}
                                      aria-hidden="true"
                                    /> */}
                                  </span>
                                  <div className="ml-4 truncate">
                                    <p className="text-sm font-medium text-gray-900 truncate">{log.student.data.Name}</p>
                                    <span className="text-sm text-gray-500 truncate">{log.student.data.Number}{' opened '}</span>
                                    <span className="text-sm font-medium text-gray-900 truncate">{log.value}</span>
                                  </div>
                                </div>
                              </a>
                              <Menu as="div" className="ml-2 relative inline-block text-left">
                                {({ showNotificationList }) => (
                                  <>
                                    {/* <Menu.Button className="group relative w-8 h-8 bg-white rounded-full inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                      <span className="sr-only">Open options menu</span>
                                      <span className="flex items-center justify-center h-full w-full rounded-full">
                                        <DotsVerticalIcon
                                          className="w-5 h-5 text-gray-400 group-hover:text-gray-500"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    </Menu.Button> */}
                                    <Transition
                                      show={showNotificationList}
                                      as={Fragment}
                                      enter="transition ease-out duration-100"
                                      enterFrom="transform opacity-0 scale-95"
                                      enterTo="transform opacity-100 scale-100"
                                      leave="transition ease-in duration-75"
                                      leaveFrom="transform opacity-100 scale-100"
                                      leaveTo="transform opacity-0 scale-95"
                                    >
                                      <Menu.Items
                                        static
                                        className="origin-top-right absolute z-10 top-0 right-9 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                      >
                                        <div className="py-1">
                                          <Menu.Item>
                                            {({ active }) => (
                                              <a
                                                href="#"
                                                className={classNames(
                                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                  'block px-4 py-2 text-sm'
                                                )}
                                              >
                                                View profile
                                              </a>
                                            )}
                                          </Menu.Item>
                                          <Menu.Item>
                                            {({ active }) => (
                                              <a
                                                href="#"
                                                className={classNames(
                                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                  'block px-4 py-2 text-sm'
                                                )}
                                              >
                                                Send message
                                              </a>
                                            )}
                                          </Menu.Item>
                                        </div>
                                      </Menu.Items>
                                    </Transition>
                                  </>
                                )}
                              </Menu>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <Transition.Root show={signOutModalOpen} as={Fragment}>
          <Dialog
            as="div"
            static
            className="fixed z-10 inset-0 overflow-y-auto"
            initialFocus={cancelButtonRef}
            open={signOutModalOpen}
            onClose={setSignOutModalOpen}
          >
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
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-400">
                      <LogoutIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Sign Out
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to sign out?
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                      onClick={() => setSignOutModalOpen(false)}
                      onClick={() => {
                        clearStorage()
                        window.location.href = "/"
                      }}
                    >
                      Sign Out
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={() => setSignOutModalOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
    )
}

export default Home
