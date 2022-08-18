import styles from "./RemoveLiquidityInterface.module.css"
import { useNotification } from "web3uikit";
import { useEffect, useState } from "react";
import tokens from "../constants/tokens.json"
import ERC20Abi from "../constants/ERC20.json"
import factoryAbi from "../constants/Factory.json"
import routerAbi from "../constants/Router.json"
import pairAbi from "../constants/Pair.json"
import { useWeb3Contract, useMoralis } from 'react-moralis';
import { ethers } from "ethers";
import {routerAddress, factoryAddress, ZERO_ADDRESS} from "../constants/main"
import ChooseTokenInput from "./ChooseTokenInput";
import ChooseCustomToken from "./ChooseCustomToken";
import ChooseTokenAmount from "./ChooseTokenAmount";
import SwitchTokenInputMode from "./SwitchTokenInputMode";

const AddLiquidityInterface = () => {
    const { runContractFunction } = useWeb3Contract();
    const { account, isWeb3Enabled } = useMoralis();

    const dispatch = useNotification()

    const [liquidityAmount, setLiquidityAmount] = useState(0)
    const [liquidityApproved, setLiquidityApproved] = useState(0)
    const [tokenA, setTokenA] = useState(tokens[0])
    const [tokenB, setTokenB] = useState(tokens[1])
    const [liquidityBalance, setLiquidityBalance] = useState(0)
    const [pairAddress, setPairAddress] = useState(ZERO_ADDRESS)
    const [tokenARate, setTokenARate] = useState(0)
    const [tokenBRate, setTokenBRate] = useState(0)
    const [customTokenA, setCustomTokenA] = useState(false)
    const [customTokenB, setCustomTokenB] = useState(false)

    useEffect(() => {
        if (account) {
            checkAllowance()
            checkBalance()
            getRates()
        }
    }, [tokenA, tokenB, account, pairAddress])

    useEffect(() => {
        account && getPairAddress()
    }, [tokenA, tokenB, isWeb3Enabled])

    const checkBalance = async () => {
        const balancheCheckAOptions = {
            abi: ERC20Abi,
            contractAddress: pairAddress,
            functionName: "balanceOf",
            params: {
              account: account,
            },
        };

        await runContractFunction({
            params: balancheCheckAOptions,
            onSuccess: (balance) => setLiquidityBalance(parseInt(ethers.utils.formatEther(balance))),
            onError: () => setLiquidityBalance(0),
        });
    }

    const checkAllowance = async () => {
        const allowanceAOptions = {
            abi: pairAbi,
            contractAddress: pairAddress,
            functionName: "allowance",
            params: {
              owner: account,
              spender: routerAddress,
            },
        };
      
        await runContractFunction({
            params: allowanceAOptions,
            onSuccess: (allowance) => setLiquidityApproved(parseInt(ethers.utils.formatEther(allowance))),
            onError: () => setLiquidityApproved(0),
        });
    }

    const getRates = async () => {
        const getRatesOptions = {
            abi: pairAbi,
            contractAddress: pairAddress,
            functionName: "getRatesPerLiquidityToken",
            params: {}
        }

        await runContractFunction({
            params: getRatesOptions,
            onSuccess: (response) => handleGetRatesSuccess(response),
        });
    }

    const handleGetRatesSuccess = (response) => {
        const {firstToken, firstTokenRate, secondToken, secondTokenRate} = response
        tokenA.address === firstToken ? setTokenARate(parseFloat(ethers.utils.formatEther(firstTokenRate))) : setTokenBRate(parseFloat(ethers.utils.formatEther(firstTokenRate)))
        tokenB.address === firstToken ? setTokenARate(parseFloat(ethers.utils.formatEther(secondTokenRate))) : setTokenBRate(parseFloat(ethers.utils.formatEther(secondTokenRate)))
    }

    const approveLiquidityToken = async () => {
        const amountAInGwei = ethers.utils.parseEther(liquidityAmount.toString())

        const approveOptions = {
          abi: ERC20Abi,
          contractAddress: pairAddress,
          functionName: "approve",
          params: {
            spender: routerAddress,
            amount: amountAInGwei,
          },
        };
    
        await runContractFunction({
          params: approveOptions,
          onSuccess: (tx) => handleApproveSuccess(tx),
          onError: () => handleApproveError(),
        });
    }

    const handleApproveError = () => {
        dispatch({
            type:"error",
            title:"Error!",
            message:"Problem approving tokens!",
            position: "topR"
        })
    }

    const getPairAddress = async () => {
        const getPairOptions = {
            abi: factoryAbi,
            contractAddress: factoryAddress,
            functionName: "getPairAddress",
            params: {
              firstToken: tokenA.address,
              secondToken: tokenB.address,
            }
        };
      
        await runContractFunction({
            params: getPairOptions,
            onSuccess: (address) => setPairAddress(address),
            onError: () => setPairAddress(ZERO_ADDRESS),
        });
    }

    const handleApproveSuccess = async (tx) => {
        await tx.wait(1)
        setLiquidityApproved(liquidityAmount) 
        dispatch({
            type:"success",
            title:"Success!",
            message:"Approval successfull!",
            position: "topR"
        })
    }

    const changeLiquidityAmount = (event) => {
        event.target.value ? setLiquidityAmount(parseFloat(event.target.value)) : setLiquidityAmount(0)
        getRates()
    }

    const changeTokenB = (event) => {
        let id = parseInt(event.id)
        setTokenB(tokens[id])
    }

    const changeTokenA = (event) => {
        let id = parseInt(event.id)
        setTokenA(tokens[id])
    }

    const removeLiquidity = async () => {
        const addLiquidityOptions = {
            abi: routerAbi,
            contractAddress: routerAddress,
            functionName: "removeLiquidity",
            params: {
              firstToken: tokenA.address,
              secondToken: tokenB.address,
              amount: ethers.utils.parseEther(liquidityAmount.toString()),
            },
        };

        await runContractFunction({
            params: addLiquidityOptions,
            onSuccess: (tx) => removeLiquiditySuccess(tx),
            onError: () => removeLiquidityError(),
        });
    }

    const removeLiquidityError = () => {
        dispatch({
            type:"error",
            title:"Error!",
            message:"Problem removing liquidity!",
            position: "topR"
        })
    }

    const removeLiquiditySuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type:"success",
            title:"Success!",
            message:"Liquidity removed successfully!",
            position: "topR"
        })
        checkAllowance()
        checkBalance()
    }

    const handleCustomTokenA = () => {
        customTokenA && setTokenA(tokens[0])
        setCustomTokenA(!customTokenA)
    }

    const handleCustomTokenB = () => {
        customTokenB && setTokenB(tokens[1])
        setCustomTokenB(!customTokenB)
    }
    
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Remove liquidity:</h1>
            <div className={styles.inputAmountContainer}>
                <span className={styles.maxToken}>Max: {liquidityBalance}</span>
                <ChooseTokenAmount onChange={changeLiquidityAmount} value={liquidityAmount}/>
            </div>
            <div className={styles.tokenInputContainer}>
                <div className={styles.tokenContainer}>
                    <SwitchTokenInputMode onClick={handleCustomTokenA} token={customTokenA}/>           
                    {customTokenA && <ChooseCustomToken label="Token A" setToken={setTokenA}/>}
                    {!customTokenA && <ChooseTokenInput label="Token A" defaultIndex={0} onChange={changeTokenA}/>}
                </div>
                <div className={styles.tokenContainer}>
                    <SwitchTokenInputMode onClick={handleCustomTokenB} token={customTokenB}/>           
                    {customTokenB && <ChooseCustomToken label="Token B" setToken={setTokenB}/>}
                    {!customTokenB && <ChooseTokenInput label="Token B" defaultIndex={1} onChange={changeTokenB}/>}
                </div>
            </div>
            <div className={styles.rates}>
                <span>You will get back:</span>
                <span>{(liquidityAmount*tokenARate).toFixed(2)} {tokenA.prefix ? tokenA.prefix : "Invalid token"}</span>
                <span>{(liquidityAmount*tokenBRate).toFixed(2)} {tokenB.prefix ? tokenB.prefix : "Invalid token"}</span>
            </div>
            {!liquidityAmount && <button className={styles.disabledButton}>Choose amounts</button>}
            {liquidityAmount > 0 && liquidityBalance < parseFloat(liquidityAmount) && <button className={styles.disabledButton}>Insufficient balance</button>}
            {liquidityAmount > 0 && liquidityBalance >= parseFloat(liquidityAmount) && liquidityApproved < parseFloat(liquidityAmount) && <button className={styles.mainButton} onClick={approveLiquidityToken}>Approve</button>}
            {liquidityAmount > 0 && liquidityBalance >= parseFloat(liquidityAmount) && liquidityApproved >= parseFloat(liquidityAmount) && <button className={styles.mainButton} onClick={removeLiquidity}>Remove</button>}
        </div>
    )
}

export default AddLiquidityInterface;