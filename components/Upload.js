import React, { useState } from 'react'

const posenet = require('@tensorflow-models/posenet')

async function estimateMultiplePosesOnImage(imageElement) {
  // load the model
  const net = await posenet.load()

  // get the poses
  const poses = await net.estimateMultiplePoses(imageElement, {
    flipHorizontal: false,
    maxDetections: 2,
    scoreThreshold: 0.6,
    nmsRadius: 20,
  })

  return poses
}

export default function Upload1() {
  const [image, setImage] = useState()

  const handleChange = e => {
    if (e.target.files.length) {
      setImage(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleUpload = async e => {
    e.preventDefault()
    const preview = document.getElementById('preview')
    estimateMultiplePosesOnImage(preview).then(p => {
      console.log(p)
    })
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
