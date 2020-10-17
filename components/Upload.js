import React, { useState } from 'react'

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
  })}

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
            <span className="fa-stack fa-2x mt-3 mb-2">
              <i className="fas fa-circle fa-stack-2x" />
              <i className="fas fa-store fa-stack-1x fa-inverse" />
            </span>
            <h5 className="text-center">Upload your photo</h5>
          </>
        )}
      </label>
      <input
        type="file"
        id="upload-button"
        style={{ display: 'none' }}
        onChange={handleChange}
        accept="image/png, image/jpeg"
      />
      <br />
      <button onClick={handleUpload}>Upload</button>
    </div>
  )
}

function getRelevantPoseInfos(pose) {
  const xEye = (pose.keypoints[1].position.x + pose.keypoints[2].position.x)/2
  const yEye = (pose.keypoints[1].position.y + pose.keypoints[2].position.y)/2
  const poseHeight = ((pose.keypoints[16].position.y + pose.keypoints[15].position.y)/2) - yEye
  return { xEye: xEye, yEye: yEye, poseHeight: poseHeight, score: pose.score }
}