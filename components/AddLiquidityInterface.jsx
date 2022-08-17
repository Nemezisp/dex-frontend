import styles from "./AddLiquidityInterface.module.css"
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

    const [amountA, setAmountA] = useState(0)
    const [amountB, setAmountB] = useState(0)
    const [tokenA, setTokenA] = useState(tokens[0])
    const [tokenB, setTokenB] = useState(tokens[1])
    const [exchangeRate, setExchangeRate] = useState(0)
    const [tokenAApproved, setTokenAApproved] = useState(0)
    const [tokenABalance, setTokenABalance] = useState(0)
    const [tokenBApproved, setTokenBApproved] = useState(0)
    const [tokenBBalance, setTokenBBalance] = useState(0)
    const [pairAddress, setPairAddress] = useState(ZERO_ADDRESS)
    const [customTokenA, setCustomTokenA] = useState(false)
    const [customTokenB, setCustomTokenB] = useState(false)
    const [tokenALiquidity, setTokenALiquidity] = useState(0)
    const [tokenBLiquidity, setTokenBLiquidity] = useState(0)
    
    useEffect(() => {
        const checkInterval = setInterval(async () => {
            if (account && pairAddress !== ZERO_ADDRESS) {
                await getCurrentLiquidity()
                await updateAmountB()
            }
        }, 15000)
        return(() => {
            clearInterval(checkInterval)
        })
    }, [])

    useEffect(() => {
        if (account && tokenA.prefix && tokenB.prefix) {
            checkAllowances()
            checkBalances()
        }
    }, [tokenA, tokenB, account])

    useEffect(() => {
        account && updateAmountB()
    }, [exchangeRate])

    useEffect(() => {
        account && getCurrentLiquidity()
    }, [pairAddress])

    useEffect(() => {
        if (account) {
            getRate()
            getPairAddress()
        }
    }, [tokenA, tokenB, isWeb3Enabled])

    const checkBalances = async () => {
        const balancheCheckAOptions = {
            abi: ERC20Abi,
            contractAddress: tokenA.address,
            functionName: "balanceOf",
            params: {
              account: account,
            },
        };

        const balancheCheckBOptions = {
            abi: ERC20Abi,
            contractAddress: tokenB.address,
            functionName: "balanceOf",
            params: {
              account: account,
            },
        };

        await runContractFunction({
            params: balancheCheckAOptions,
            onSuccess: (balance) => setTokenABalance(parseInt(ethers.utils.formatEther(balance))),
        });

        await runContractFunction({
            params: balancheCheckBOptions,
            onSuccess: (balance) => setTokenBBalance(parseInt(ethers.utils.formatEther(balance))),
        });
    }

    const checkAllowances = async () => {
        const allowanceAOptions = {
            abi: ERC20Abi,
            contractAddress: tokenA.address,
            functionName: "allowance",
            params: {
              owner: account,
              spender: routerAddress,
            },
        };

        const allowanceBOptions = {
            abi: ERC20Abi,
            contractAddress: tokenB.address,
            functionName: "allowance",
            params: {
              owner: account,
              spender: routerAddress,
            },
        };
      
        await runContractFunction({
            params: allowanceAOptions,
            onSuccess: (allowance) => setTokenAApproved(parseInt(ethers.utils.formatEther(allowance))),
        });

        await runContractFunction({
            params: allowanceBOptions,
            onSuccess: (allowance) => setTokenBApproved(parseInt(ethers.utils.formatEther(allowance))),
        });
    }

    const approveToken = async (token) => {
        const amount = token === "A" ? amountA : amountB;
        const tokenToApprove = token === "A" ? tokenA : tokenB;

        const amountAInGwei = ethers.utils.parseEther(amount.toString())

        const approveOptions = {
          abi: ERC20Abi,
          contractAddress: tokenToApprove.address,
          functionName: "approve",
          params: {
            spender: routerAddress,
            amount: amountAInGwei,
          },
        };
    
        await runContractFunction({
          params: approveOptions,
          onSuccess: (tx) => handleApproveSuccess(tx, token),
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

    const getRate = async () => {
        const getRateOptions = {
            abi: routerAbi,
            contractAddress: routerAddress,
            functionName: "getQuote",
            params: {
              tokenToSell: tokenA.address,
              tokenToBuy: tokenB.address,
              tokenToSellAmount: ethers.utils.parseEther("1")
            },
        };
      
        await runContractFunction({
            params: getRateOptions,
            onSuccess: (quote) => handleGetRateSuccess(quote),
            onError: (error) => handleGetRateError(error),
        });
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

    const handleGetRateSuccess = (quote) => {
        const quoteNumber = ethers.utils.formatEther(quote)
        setExchangeRate(quoteNumber)
    }

    const handleGetRateError = (error) => {
        setExchangeRate(0)
    }

    const handleApproveSuccess = async (tx, token) => {
        await tx.wait(1)
        token === "A" ? setTokenAApproved(amountA) : setTokenBApproved(amountB)
    }

    const changeAmountA = (event) => {
        event.target.value ? setAmountA(parseFloat(event.target.value)) : setAmountA(0)
        exchangeRate && setAmountB(event.target.value*exchangeRate)
    }

    const changeAmountB = (event) => {
        event.target.value ? setAmountB(parseFloat(event.target.value)) : setAmountB(0)
        exchangeRate && setAmountA(event.target.value/exchangeRate)
    }

    const updateAmountB = () => {
        setAmountB(amountA*exchangeRate)
    }

    const changeTokenB = (event) => {
        let id = parseInt(event.id)
        setTokenB(tokens[id])
    }

    const changeTokenA = (event) => {
        let id = parseInt(event.id)
        setTokenA(tokens[id])
    }

    const addLiquidity = async () => {        
        const addLiquidityOptions = {
            abi: routerAbi,
            contractAddress: routerAddress,
            functionName: "addLiquidity",
            params: {
              firstToken: tokenA.address,
              secondToken: tokenB.address,
              firstAmount: ethers.utils.parseEther(amountA.toString()),
              secondAmount: ethers.utils.parseEther(amountB.toString())
            },
        };

        await runContractFunction({
            params: addLiquidityOptions,
            onSuccess: (tx) => addLiquiditySuccess(tx),
            onError: () => addLiquidityError(),
        });
    }

    const addLiquidityError = () => {
        dispatch({
            type:"error",
            title:"Error!",
            message:"Problem adding liquidity!",
            position: "topR"
        })
    }

    const addLiquiditySuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type:"success",
            title:"Success!",
            message:"Liquidity added successfully!",
            position: "topR"
        })
        getRate()
        checkBalances()
        checkAllowances()
        getCurrentLiquidity()
    }

    const handleCustomTokenA = () => {
        customTokenA && setTokenA(tokens[0])
        setCustomTokenA(!customTokenA)
    }

    const handleCustomTokenB = () => {
        customTokenB && setTokenB(tokens[1])
        setCustomTokenB(!customTokenB)
    }

    const getCurrentLiquidity = async () => {
        let totalSupply;

        const getRatesOptions = {
            abi: pairAbi,
            contractAddress: pairAddress,
            functionName: "getRatesPerLiquidityToken",
            params: {}
        }

        const getTotalSupplyOptions = {
            abi: pairAbi,
            contractAddress: pairAddress,
            functionName: "totalSupply",
            params: {}
        }

        await runContractFunction({
            params: getTotalSupplyOptions,
            onSuccess: (supply) => totalSupply = parseFloat(ethers.utils.formatEther(supply)),
        })

        await runContractFunction({
            params: getRatesOptions,
            onSuccess: (response) => handleGetRatesSuccess(response, totalSupply),
            onError: () => handleGetRatesError(),
        });
    }

    const handleGetRatesSuccess = (response, supply) => {
        const {firstToken, firstTokenRate, secondToken, secondTokenRate} = response
        tokenA.address === firstToken ? setTokenALiquidity(parseFloat(ethers.utils.formatEther(firstTokenRate))*supply) : setTokenBLiquidity(parseFloat(ethers.utils.formatEther(firstTokenRate))*supply)
        tokenB.address === firstToken ? setTokenALiquidity(parseFloat(ethers.utils.formatEther(secondTokenRate))*supply) : setTokenBLiquidity(parseFloat(ethers.utils.formatEther(secondTokenRate))*supply)
    }

    const handleGetRatesError = () => {
        setTokenALiquidity(0)
        setTokenBLiquidity(0)
    }
    
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Add liquidity:</h1>
            <div className={styles.aboveTokenContainer}>
                {tokenA.prefix ? <span className={styles.maxToken}>Max: {tokenABalance} {tokenA.prefix}</span> : <span className={styles.maxToken}>Invalid token</span>}
                <SwitchTokenInputMode onClick={handleCustomTokenA} token={customTokenA}/>        
            </div>    
            <div className={styles.tokenInputContainer}>
                <ChooseTokenAmount onChange={changeAmountA} value={amountA}/>
                {customTokenA && <ChooseCustomToken label="Token A" setToken={setTokenA}/>}
                {!customTokenA && <ChooseTokenInput label="Token A" onChange={changeTokenA} defaultIndex={0}/>}
            </div>
            <div className={styles.aboveTokenContainer}>
                {tokenB.prefix ? <span className={styles.maxToken}>Max: {tokenBBalance} {tokenB.prefix}</span> : <span className={styles.maxToken}>Unknown token</span>}
                <SwitchTokenInputMode onClick={handleCustomTokenB} token={customTokenB}/>                
            </div>    
            <div className={styles.tokenInputContainer}>
                <ChooseTokenAmount onChange={changeAmountB} value={amountB}/>
                {customTokenB && <ChooseCustomToken label="Token B" setToken={setTokenB}/>}
                {!customTokenB && <ChooseTokenInput label="Token B" onChange={changeTokenB} defaultIndex={1}/>}
            </div>
            <div className={styles.liquidity}>
                <span>Current liquidity:</span>
                <span>{tokenALiquidity.toFixed(2)} {tokenA.prefix ? tokenA.prefix : "X"}</span>
                <span>{tokenBLiquidity.toFixed(2)} {tokenB.prefix ? tokenB.prefix : "X"}</span>
            </div>
            {(!amountA || !amountB) && <button className={styles.disabledButton}>Choose amounts</button>}
            {amountA > 0 && amountB > 0 && (tokenA.address === tokenB.address || !tokenA.prefix || !tokenB.prefix) && <button className={styles.disabledButton}>Invalid tokens</button>}
            {amountA > 0 && amountB > 0 && tokenA.address !== tokenB.address && tokenA.prefix && tokenB.prefix && (tokenABalance < parseFloat(amountA) || tokenBBalance < parseFloat(amountB)) && <button className={styles.disabledButton}>Insufficient balance</button>}
            {amountA > 0 && amountB > 0 && tokenA.address !== tokenB.address && tokenA.prefix && tokenB.prefix && tokenABalance >= parseFloat(amountA) && tokenBBalance >= parseFloat(amountB) && tokenAApproved < parseFloat(amountA) && <button className={styles.mainButton} onClick={() => approveToken("A")}>Approve {tokenA.prefix}</button>}
            {amountA > 0 && amountB > 0 && tokenA.address !== tokenB.address && tokenA.prefix && tokenB.prefix && tokenABalance >= parseFloat(amountA) && tokenBBalance >= parseFloat(amountB) && tokenAApproved >= parseFloat(amountA) && tokenBApproved < parseFloat(amountB) && <button className={styles.mainButton} onClick={() => approveToken("B")}>Approve {tokenB.prefix}</button>}
            {amountA > 0 && amountB > 0 && tokenA.address !== tokenB.address && tokenA.prefix && tokenB.prefix && tokenABalance >= parseFloat(amountA) && tokenBBalance >= parseFloat(amountB) && tokenAApproved >= parseFloat(amountA) && tokenBApproved >= parseFloat(amountB) && <button className={styles.mainButton} onClick={addLiquidity}>Add</button>}
        </div>
    )
}

export default AddLiquidityInterface;