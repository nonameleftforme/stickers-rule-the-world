import '../styles/index.css'

function MyApp({ Component, pageProps }) {
  return (
    <div className="font-krakel">
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
