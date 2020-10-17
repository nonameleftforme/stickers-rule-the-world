import Nav from '../components/Nav'
import StickerPanel from '../components/stickerPanel'
import Upload from '../components/Upload'

export default function IndexPage() {
  return (
    <div>
      <Nav />
      <div className="py-20">
        <h1 className="text-5xl text-center text-accent-1">
          Sticker rules the world
        </h1>
        <Upload />
        <StickerPanel />
      </div>
    </div>
  )
}
