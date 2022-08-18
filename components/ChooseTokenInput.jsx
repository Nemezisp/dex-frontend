import tokenList from "../constants/tokens.json"
import { Select } from "web3uikit"
import { useMoralis } from "react-moralis"

const ChooseTokenInput = ({label, onChange, defaultIndex}) => {
    const {chainId} = useMoralis()
    const tokens = tokenList[parseInt(chainId, 16).toString()]

    const tokenOptions = tokens.map((token, index) => {
        return {
            id: index,
            label: token.name,
            prefix: token.prefix
        }
    })

    return (
        <Select
            defaultOptionIndex={defaultIndex}
            label={label}
            onChange={onChange}
            width="220px"
            options={tokenOptions}
        />
    )
}

export default ChooseTokenInput;