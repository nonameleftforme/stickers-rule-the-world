import React, { useState } from 'react'
import mergeImages from 'merge-images'
import StickerPanel from './stickerPanel'
import * as posenet from '@tensorflow-models/posenet'

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
  const [instructionAlert, setInstructionAlert] = useState(false)

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

      // number of image pixels in 1 rendered CSS pixel
      const scaleFactor = preview.naturalWidth / preview.width;

      // collect relevant info and convert to image coordinates
      setPoseInfo(poses.map(pose => {
        const xEye = (pose.keypoints[1].position.x + pose.keypoints[2].position.x) / 2 * scaleFactor;
        const yEye = (pose.keypoints[1].position.y + pose.keypoints[2].position.y) / 2 * scaleFactor;
        const poseHeight =
          ((pose.keypoints[16].position.y + pose.keypoints[15].position.y) / 2 - yEye) * scaleFactor;
        return {
          xEye: xEye,
          yEye: yEye,
          poseHeight: poseHeight,
          score: pose.score
        };
      }));

      setInstructionAlert(true)
    })
  }

  const handleMerge = async e => {
    e.preventDefault()
    const poseSrc = poseInfo.map(function (pose) {
      return {
        src: sticker,
        x: pose.xEye - 250, // translate so Ketnipz eyes somewhat line up with pose eyes
        y: pose.yEye - 55,
      }
    })
    console.log(poseSrc)
    mergeImages([{ src: image, x: 0, y: 0 }].concat(poseSrc)).then(
      b64 => (document.querySelector('img').src = b64)
    )
  }

  return (
    <div className="justify-center">
      {instructionAlert && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 rounded px-4 py-3 block mx-auto max-w-md m-4 text-center"
          role="alert"
        >
          <strong className="uppercase text-xl font-bold">
            Choose a sticker
          </strong>
          <span className="block text-xl">
            You can change them again and again if you want
          </span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg
              className="fill-current h-6 w-6 text-green-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            ></svg>
          </span>
        </div>
      )}
      {sizeAlert && (
        <div
          className="bg-pink-100 border border-pink-400 text-pink-700 rounded px-4 py-3 block mx-auto max-w-md m-4 text-center"
          role="alert"
        >
          <strong className="uppercase text-xl font-bold">
            Image is to big!
          </strong>
          <span className="block text-xl">Please upload a smaller one</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg
              className="fill-current h-6 w-6 text-pink-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            ></svg>
          </span>
        </div>
      )}
      {image ? (
        <div className="block md:w-3/6 lg:w-2/6 mx-auto my-4">
          <img src={image} id="preview" alt="preview" className="mt-0" />
        </div>
      ) : (
        <>
          <div className="flex w-full h-screen items-center justify-center bg-grey-lighter">
            <label className="lg:w-2/5 btn-upper-pink">
              <img
                src="/stickers/cloud.png"
                alt="upload"
                className="lg:w-1/6 sm:w-1/3"
              />
              <span className="mt-2 uppercase text-3xl leading-normal font-bold">
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
      {image && !poseInfo && (
        <div className="block mx-auto max-w-md ">
          <button
            onClick={handleUpload}
            className="btn-upper-pink sm:w-5/6 md:w-3/6 lg:w-2/6 mx-auto"
          >
            Upload
          </button>
        </div>
      )}
      {poseInfo && (
        <div className="block max-w-2xl m-auto">
          <StickerPanel onStickerSelect={sticker => setSticker(sticker)} />
        </div>
      )}
      {sticker && (
        <div className="block m-4">
          <button
            onClick={handleMerge}
            className="btn-upper-pink sm:w-5/6 md:w-3/6 lg:w-2/6 mx-auto"
          >
            merge this shit
          </button>
        </div>
      )}
    </div>
  )
}

function fileToBig(file) {
  if (file.size > 300000) {
    return true
  }
  return false
}
