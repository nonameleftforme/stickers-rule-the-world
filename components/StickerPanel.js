const stickers = ['happyjump', 'hug', 'music', 'neutral']
export default function StickerPanel() {
  return (
    <div>
      <ul className="flex justify-between items-center space-x-4">
        {stickers.map(filename => (
          <li key={`${filename}`}>
            <img
              src={`/images/${filename}.png`}
              height="500"
              alt={`${filename}`}
              id={`${filename}`}
            />
            {/* <a href="/" className="btn-blue no-underline">
              </a> */}
          </li>
        ))}
      </ul>
    </div>
  )
}
