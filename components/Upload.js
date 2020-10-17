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

  const handleChange = e => {
    if (e.target.files.length) {
      setImage(URL.createObjectURL(e.target.files[0]))
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
      const poseInfo = poses.map(pose => getRelevantPoseInfos(pose))
      console.log(poseInfo)
    })
  }

  const handleMerge = async e => {
    e.preventDefault()
    mergeImages([
      { src: image, x: 0, y: 0 },
      { src: '/images/music.png', x: 532, y: 0 },
    ]).then(b64 => (document.querySelector('img').src = b64))
  }

  return (
    <div>
      <label htmlFor="upload-button">
        {image ? (
          <img
            src={image}
            id="preview"
            alt="preview"
            width="300"
            height="300"
          />
        ) : (
          <>
            <div className="flex w-full h-screen items-center justify-center bg-grey-lighter">
              <label className="w-64 flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                </svg>
                <span className="mt-2 text-base leading-normal">
                  Select a file
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
      </label>
      <br />
      <button onClick={handleUpload} className="btn-blue no-underline">
        Upload
      </button>
      <StickerPanel />
      <button onClick={handleMerge} className="btn-blue no-underline">
        merge this shit
      </button>
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
