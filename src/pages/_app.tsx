import Head from 'next/head';
import type { AppProps } from 'next/app';
import './../styles/globals.css';
import axios from 'axios';

axios.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

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