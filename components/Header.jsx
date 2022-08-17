import {ConnectButton} from "web3uikit"
import styles from "./Header.module.css"
import Link from "next/link"

const Header = () => {
    return (
        <nav className={styles.navBar}>
            <h1>Best DEX ever!</h1>
            <div className={styles.links} id="connectContainer">
                <Link href="/"><a className={styles.headerLink}>Swap</a></Link>
                <Link href="/liquidity"><a className={styles.headerLink}>Liquidity</a></Link>
                <ConnectButton/>
            </div>
        </nav>
    )
}

export default Header;