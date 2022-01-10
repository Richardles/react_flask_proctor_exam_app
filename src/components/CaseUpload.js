import React, { useState } from 'react'
import firebase from '../firebase'

const CaseUpload = () => {

    const [progress, setProgress] = useState(0);

    let file
    function uploadCase(e){
        console.log(e.target.files)
        file = e.target.files[0]
        var storage = firebase.storage()
        storage.ref(
            `/Docs/${e.target.files[0].name}`
        ).put(e.target.files[0])
        .on(firebase.storage.TaskEvent.STATE_CHANGED,
            function(snapshot){
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                setProgress(progress.toFixed(2));
            })
    }

    function downloadCase(){
        var storage = firebase.storage()
        var url = storage.ref('2110/COMP6232001/BB04/assignment1/case/O222-COMP6232-JF01-00.docx')
        url.getDownloadURL().then(function(url){
            var element = document.createElement('a');
            element.setAttribute('download', url);
            document.body.appendChild(element);
            element.click();
        })
    }

    return (
        <div className="flex justify-center">
            <div className="w-full">
                <div className="m-4">
                    <label className="inline-block mb-2 text-gray-500">{!!(file) ? (progress < 100 ? `Uploading.. ${file.name}` : `${file.name} uploaded`) : 'File Upload'}</label>
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
                                    Attach a file</p>
                            </div>
                            <input type="file" className="opacity-0" onChange={uploadCase}/>
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
    )
}

export default CaseUpload
