import styles from '../styles/Home.module.css'
import SwapInterface from '../components/SwapInterface'
import { useMoralis } from 'react-moralis'

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <SwapInterface/>
      </main>
    </div>
  )
}
