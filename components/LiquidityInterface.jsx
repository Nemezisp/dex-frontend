import styles from "./LiquidityInterface.module.css"
import { useState } from "react";
import AddLiquidityInterface from "./AddLiquidityInterface";
import RemoveLiquidityInterface from "./RemoveLiquidityInterface"

const LiquidityInterface = () => {

    const [currentMode, setCurrentMode] = useState("add")
    
    return (
        <div className={styles.container}>
            <div className={styles.options}>
                <div onClick={() => setCurrentMode("add")} className={currentMode === "add" ? styles.optionChosen : styles.option}>Add</div>
                <div onClick={() => setCurrentMode("remove")} className={currentMode === "remove" ? styles.optionChosen : styles.option}>Remove</div>
            </div>
            {currentMode === "add" ? <AddLiquidityInterface/> : <RemoveLiquidityInterface/>}
        </div>
    )
}

export default LiquidityInterface;