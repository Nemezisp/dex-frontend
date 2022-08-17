import styles from "./SwitchTokenInputMode.module.css"

const SwitchTokenInputMode = ({token, onClick}) => {
    return (
        <span className={styles.action} onClick={onClick}>
            {token ? "Back to the list" : "Token not on the list?"}
        </span>    
    )
}

export default SwitchTokenInputMode;