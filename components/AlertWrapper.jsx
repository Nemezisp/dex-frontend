import styles from "./AlertWrapper.module.css"
import { useMoralis } from "react-moralis";

const AlertWrapper = (props) => {
    const {isWeb3Enabled, chainId} = useMoralis()

    return (
        <div>
            {isWeb3Enabled ? parseInt(chainId, 16) === 31337 ? props.children                                        
                                            : <div className={styles.alertContainer}>
                                                Switch network to localhost!
                                                </div>
                        : <div className={styles.alertContainer}>
                            Connect your wallet!
                            </div>
            }
        </div>
    )
}

export default AlertWrapper;