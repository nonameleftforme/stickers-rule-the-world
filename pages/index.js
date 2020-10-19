import Upload from '../components/Upload'
import Head from 'next/head'

export default function IndexPage() {
  return (
    <div>
      <Head>
        <title>Stickers rule the world</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta charset="utf-8" />
      </Head>
      <Upload />
    </div>
  )
}
