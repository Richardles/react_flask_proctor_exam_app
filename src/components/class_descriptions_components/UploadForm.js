import * as React from 'react';
import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon, Upload, UploadIcon } from '@heroicons/react/outline'
import CaseUpload from '../CaseUpload';
import firebase from '../../firebase'

const UploadForm = (props) => {

    const [open, setOpen] = useState(true)
    const cancelButtonRef = useRef()
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState();
    const [grayOpacity, setGrayOpacity] = useState(700);

    let classData = props.classData
    let caseType = props.caseType
    let storageDirectory = '/2110/' + classData.CourseCode + '/' + classData.ClassName + '/' + caseType.Type + '/case'

    function uploadCase(){
        if(file === undefined){
            props.setUploaded(false);
            setOpen(false)
            props.formOpen(false)
            return;
        }
        var storage = firebase.storage()
        storage.ref(`${storageDirectory}`).listAll().then(res => {
            res.items.forEach(item =>{
                if(item.name != file.name){
                    item.delete();
                }
            })
        })
        storage.ref(
            `${storageDirectory}/${file.name}`
            ).put(file)
            .on(firebase.storage.TaskEvent.STATE_CHANGED,
                function(snapshot){
                    let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    setProgress(progress.toFixed(2));
                    if(progress >= 100){
                        let temp = {
                            'Type': caseType.Type,
                            'Name': caseType.Name,
                            'File': file
                        }
                        props.setUploaded(temp)
                    setGrayOpacity(500)
                    setOpen(false)
                    props.formOpen(false)
                    }
                })
        
        fetch('/insert-exam-case-to-database',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(storageDirectory+'/'+file.name)
        }).then(res => res.json()).then((data) => {
            console.log(data);
        })
    }

    function putFile(e){
        console.log(storageDirectory);
        setFile(e.target.files[0])
    }

    return (
        <Transition.Root show={open} as={Fragment} className={`fixed inset-0 bg-gray-${grayOpacity} bg-opacity-75 transition-opacity`}>
            <Dialog
                as="div"
                static
                className="fixed z-10 inset-0 overflow-y-auto"
                initialFocus={cancelButtonRef}
                open={open}
                onClose={setOpen}
            >
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
                </Transition.Child> */}

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
                    <div>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <UploadIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                            {caseType.Name}
                        </Dialog.Title>
                        <div className="mt-2">
                            {/* Upload Start Here */}

                            <div className="flex justify-center">
                                <div className="w-full">
                                    <div className="m-4">
                                        <label className="inline-block mb-2 text-gray-500">{file ? (progress == 100 ? `${file.name} uploaded!` : progress >= 1 ? `Uploading ${file.name}` : 'File Upload' ) : 'File Upload'}</label>
                                        <div className="flex items-center justify-center w-full">
                                            <label
                                                className="flex flex-col w-full h-32 border-4 border-blue-200 border-dashed hover:bg-gray-100 hover:border-gray-300">
                                                <div className="flex flex-col items-center justify-center pt-7">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                                                        {file ?  `${file.name}` : 'Attach a file'}</p>
                                                </div>
                                                <input type="file" className="opacity-0" onChange={putFile}/>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mx-1 bg-gray-200 rounded-full">
                                        <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{width: `${progress}%`}}>{progress > 0 ? `${progress} %` : ''}</div>
                                    </div>

                                    {/* <div className="flex justify-center">
                                        <button className="w-full px-4 py-2 text-white bg-blue-500 rounded" onClick={uploadCase}>Upload</button>
                                    </div> */}
                                </div>
                            </div>

                            {/* Upload Ends Here */}
                        </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                        onClick={uploadCase}
                        >
                        Upload
                        </button>
                        <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                        onClick={() => {
                            setOpen(false)
                            props.formOpen(false)
                        }}
                        ref={cancelButtonRef}
                        >
                        Close
                        </button>
                    </div>
                    </div>

                </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default UploadForm;