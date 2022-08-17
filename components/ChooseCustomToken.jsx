import { Input } from "web3uikit"
import { ZERO_ADDRESS, addressRegExp } from "../constants/main"
import ERC20Abi from "../constants/ERC20.json"
import { useWeb3Contract } from "react-moralis"

const ChooseCustomToken = ({label, setToken}) => {
    const { runContractFunction } = useWeb3Contract();

    const changeTokenAddress = async (event) => {
        if(addressRegExp.test(event.target.value)) {
            const newToken = {
                address: event.target.value,
                prefix: "",
                name: ""
            }

            const symbolOptions = {
                abi: ERC20Abi,
                contractAddress: event.target.value,
                functionName: "symbol",
                params: {
                }
            };

            const nameOptions = {
                abi: ERC20Abi,
                contractAddress: event.target.value,
                functionName: "name",
                params: {
                }
            };

            await runContractFunction({
                params: symbolOptions,
                onSuccess: (symbol) => newToken.prefix = symbol,
                onError: (error) => console.log(error),
            });

            await runContractFunction({
                params: nameOptions,
                onSuccess: (name) => newToken.name = name,
                onError: (error) => console.log(error),
            });

            setToken(newToken)
        }
    }

    return (
        <Input
            label={label}
            style={{height: "52px", padding: "13px", border:"1px solid #C5CDD9"}}
            type="text"
            width="220px"
            validation={{
                regExp: '^0x[a-fA-F0-9]{40}$',
                regExpInvalidMessage: 'That is not a valid address'
            }}
            placeholder={ZERO_ADDRESS}
            onChange={(e) => changeTokenAddress(e)}
        />
    )
}

export default ChooseCustomToken;