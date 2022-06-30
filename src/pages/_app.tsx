import Head from 'next/head';
import type { AppProps } from 'next/app';
import './../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
        <Head>
            <title>Incopens</title>
        </Head>
        <Component {...pageProps} />
    </div>
  )
}

export default MyApp;