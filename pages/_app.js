import '../styles/globals.css'
import { MoralisProvider } from "react-moralis";
import Header from "../components/Header";
import { Fragment } from "react";
import Head from "next/head";
import { NotificationProvider } from "web3uikit";
import AlertWrapper from '../components/AlertWrapper';

function MyApp({ Component, pageProps }) {
  return ( 
    <Fragment>
      <Head>
        <title>Decentralized Exchange</title>
        <meta name="description" content="Decentralized ERC20 token exchange" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider initializeOnMount={false}>
        <NotificationProvider>
          <Header />
          <AlertWrapper>
            <Component {...pageProps} />                                        
          </AlertWrapper>
        </NotificationProvider>
      </MoralisProvider>
    </Fragment>
  )
}

export default MyApp
