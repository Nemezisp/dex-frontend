import { Input } from "web3uikit"

const ChooseTokenAmount = ({onChange, value}) => {
    return (
        <Input
            label="Amount"
            onChange = {onChange}
            min="0"
            style={{height: "52px", padding: "14px", display: "flex", justifyContent:"center", alignItems:"center"}}
            type="number"
            width="200"
            value={value}
        />
    )
}

export default ChooseTokenAmount;