const stickers = ['happyjump', 'hug', 'music', 'neutral']
export default function StickerPanel({ onStickerSelect }) {
  return (
    <div>
      <ul className="flex justify-between items-center space-x-4">
        {stickers.map(filename => (
          <li key={`${filename}`}>
            <button
              onClick={() => onStickerSelect(`/stickers/${filename}.png`)}
            >
              <img
                src={`/stickers/${filename}.png`}
                height="500"
                alt={`${filename}`}
                id={`${filename}`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
