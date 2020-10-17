import React, { useState } from 'react'
import mergeImages from 'merge-images'
import StickerPanel from './stickerPanel'

const posenet = require('@tensorflow-models/posenet')

async function estimateMultiplePosesOnImage(imageElement) {
  // load the model
  const net = await posenet.load()

  // get the poses
  const poses = await net.estimateMultiplePoses(imageElement, {
    flipHorizontal: false,
    maxDetections: 3,
    scoreThreshold: 0.6,
    nmsRadius: 20,
  })

  return poses
}

export default function Upload() {
  const [image, setImage] = useState()
  const [sticker, setSticker] = useState()
  const [poseInfo, setPoseInfo] = useState()
  const [sizeAlert, setSizeAlert] = useState(false)

  const handleChange = e => {
    if (e.target.files.length) {
      if (fileToBig(e.target.files[0])) {
        setSizeAlert(true)
      } else {
        setSizeAlert(false)
        setImage(URL.createObjectURL(e.target.files[0]))
      }
    }
  }

  const handleUpload = async e => {
    e.preventDefault()
    const preview = document.getElementById('preview')
    estimateMultiplePosesOnImage(preview).then(poses => {
      console.log(poses)
      // sort with the highest scores
      poses.sort((s1, s2) => s2.score - s1.score)
      // pick the 3 highest scored poses -> not necessary because TF only detect 3 Poses
      // poses = poses.slice(0,3)
      console.log(poseInfo)
      setPoseInfo(poses.map(pose => getRelevantPoseInfos(pose)))
    })
  }

  const handleMerge = async e => {
    e.preventDefault()
    const poseSrc = poseInfo.map(function (pose) {
      return {
        src: sticker,
        // the multiplication is random... because else they would be too close to each other
        // this with the position changes from browser to browser and doesn't place it right
        x: pose.xEye * 3,
        y: pose.yEye * 6,
      }
    })
    console.log(poseSrc)
    mergeImages([{ src: image, x: 0, y: 0 }].concat(poseSrc)).then(
      b64 => (document.querySelector('img').src = b64)
    )
  }

  return (
    <div className="">
      {sizeAlert && (
        <div
          className="bg-pink-100 border border-pink-400 text-red-700 px-4 py-3 mx-auto rounded max-w-md m-4 text-center"
          role="alert"
        >
          <strong className="font-bold uppercase text-xl font-bold">
            Image is to big!
          </strong>
          <span className="block text-xl">Please upload a smaller one</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            ></svg>
          </span>
        </div>
      )}
      {image ? (
        <img
          src={image}
          id="preview"
          alt="preview"
          className="sm:w-full"
          width="300"
          height="300"
        />
      ) : (
        <>
          <div className="flex w-full h-screen items-center justify-center bg-grey-lighter">
            <label className="lg:w-2/5 flex flex-col items-center px-4 py-6 bg-pink-100 rounded-lg shadow-lg border cursor-pointer  hover:bg-pink-300">
              {/* <svg
                className="w-8 h-8"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
              </svg> */}
              <img
                src="/stickers/cloud.png"
                alt="upload"
                className="lg:w-1/4 sm:w-1/3"
              />
              <span className="mt-2 uppercase text-base text-3xl leading-normal font-bold">
                Hi, select a file
              </span>
              <span className="text-2xl">
                with some standing people on it, thx
              </span>

              <input
                type="file"
                className="hidden"
                id="upload-button"
                onChange={handleChange}
                accept="image/png, image/jpeg"
              />
            </label>
          </div>
        </>
      )}
      <br />
      {image && (
        <button onClick={handleUpload} className="btn-blue no-underline">
          Upload
        </button>
      )}
      {poseInfo && (
        <StickerPanel onStickerSelect={sticker => setSticker(sticker)} />
      )}
      {sticker && (
        <button onClick={handleMerge} className="btn-blue no-underline">
          merge this shit
        </button>
      )}
    </div>
  )
}

function getRelevantPoseInfos(pose) {
  const xEye = (pose.keypoints[1].position.x + pose.keypoints[2].position.x) / 2
  const yEye = (pose.keypoints[1].position.y + pose.keypoints[2].position.y) / 2
  const poseHeight =
    (pose.keypoints[16].position.y + pose.keypoints[15].position.y) / 2 - yEye
  return { xEye: xEye, yEye: yEye, poseHeight: poseHeight, score: pose.score }
}

function fileToBig(file) {
  if (file.size > 300000) {
    return true
  }
  return false
}
