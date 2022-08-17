import styles from '../styles/Home.module.css'
import LiquidityInterface from '../components/LiquidityInterface'

export default function Liquidity() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <LiquidityInterface/>
      </main>
    </div>
  )
}
