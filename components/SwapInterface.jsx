import styles from "./SwapInterface.module.css"
import { useNotification } from "web3uikit";
import { useEffect, useState } from "react";
import tokens from "../constants/tokens.json"
import ERC20Abi from "../constants/ERC20.json"
import factoryAbi from "../constants/Factory.json"
import routerAbi from "../constants/Router.json"
import { useWeb3Contract, useMoralis } from 'react-moralis';
import { ethers } from "ethers";
import {routerAddress, factoryAddress, ZERO_ADDRESS} from "../constants/main"
import ChooseTokenInput from "./ChooseTokenInput";
import ChooseCustomToken from "./ChooseCustomToken";
import ChooseTokenAmount from "./ChooseTokenAmount";
import SwitchTokenInputMode from "./SwitchTokenInputMode";

const SwapInterface = () => {
    const { runContractFunction } = useWeb3Contract();
    const { account, isWeb3Enabled } = useMoralis();

    const dispatch = useNotification()

    const [amountIn, setAmountIn] = useState(0)
    const [amountOut, setAmountOut] = useState(0)
    const [tokenIn, setTokenIn] = useState(tokens[0])
    const [tokenOut, setTokenOut] = useState(tokens[1])
    const [exchangeRate, setExchangeRate] = useState(0)
    const [tokenInApproved, setTokenInApproved] = useState(0)
    const [tokenInBalance, setTokenInBalance] = useState(0)
    const [tokenOutLiquidity, setTokenOutLiquidity] = useState(0)
    const [pairAddress, setPairAddress] = useState(ZERO_ADDRESS)
    const [slippage, setSlippage] = useState(0.01)
    const [tempSlippage, setTempSlippage] = useState(0.01)
    const [changingSlippage, setChangingSlippage] = useState(false)
    const [customTokenA, setCustomTokenA] = useState(false)
    const [customTokenB, setCustomTokenB] = useState(false)

    useEffect(() => {
        if (account && tokenIn.name) {
            checkAllowance()
            checkBalance()
        }
    }, [tokenIn, account])

    useEffect(() => {
        account && updateAmountOut()
    }, [exchangeRate])

    useEffect(() => {
        if (account && tokenIn.name && tokenOut.name) {
            getPairAddress()
            getRate()
        }
    }, [tokenIn, tokenOut, isWeb3Enabled])

    useEffect(() => {
        if (account && pairAddress !== ZERO_ADDRESS) {
            getLiquidity()
        }
        if (pairAddress === ZERO_ADDRESS) {
            setTokenOutLiquidity(0)
        }
    }, [pairAddress, amountIn])

    const checkBalance = async () => {
        const balancheCheckOptions = {
            abi: ERC20Abi,
            contractAddress: tokenIn.address,
            functionName: "balanceOf",
            params: {
              account: account,
            },
        };

        await runContractFunction({
            params: balancheCheckOptions,
            onSuccess: (balance) => setTokenInBalance(parseInt(ethers.utils.formatEther(balance))),
        });
    }

    const checkAllowance = async () => {
        const allowanceOptions = {
            abi: ERC20Abi,
            contractAddress: tokenIn.address,
            functionName: "allowance",
            params: {
              owner: account,
              spender: routerAddress,
            },
          };
      
          await runContractFunction({
            params: allowanceOptions,
            onSuccess: (allowance) => setTokenInApproved(parseInt(ethers.utils.formatEther(allowance))),
          });
    }

    const approveTokenIn = async () => {
        const amountInInGwei = ethers.utils.parseEther(amountIn.toString())

        const approveOptions = {
          abi: ERC20Abi,
          contractAddress: tokenIn.address,
          functionName: "approve",
          params: {
            spender: routerAddress,
            amount: amountInInGwei,
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

    const getRate = async () => {
        const getRateOptions = {
            abi: routerAbi,
            contractAddress: routerAddress,
            functionName: "getQuote",
            params: {
              tokenToSell: tokenIn.address,
              tokenToBuy: tokenOut.address,
              tokenToSellAmount: ethers.utils.parseEther("1")
            },
        };
      
        await runContractFunction({
            params: getRateOptions,
            onSuccess: (quote) => handleGetRateSuccess(quote),
            onError: () => handleGetRateError(),
        });
    }

    const getPairAddress = async () => {
        const getPairOptions = {
            abi: factoryAbi,
            contractAddress: factoryAddress,
            functionName: "getPairAddress",
            params: {
              firstToken: tokenIn.address,
              secondToken: tokenOut.address,
            }
        };
      
        await runContractFunction({
            params: getPairOptions,
            onSuccess: (address) => setPairAddress(address),
            onError: (error) => console.log(error),
        });
    }

    const getLiquidity = async () => {
        const getLiquidityOptions = {
            abi: ERC20Abi,
            contractAddress: tokenOut.address,
            functionName: "balanceOf",
            params: {
              account: pairAddress,
            },
        };
      
        await runContractFunction({
            params: getLiquidityOptions,
            onSuccess: (amount) => setTokenOutLiquidity(ethers.utils.formatEther(amount)),
            onError: () => setTokenOutLiquidity(0),
        });
    }

    const swapTokens = async () => {
        const swapOptions = {
            abi: routerAbi,
            contractAddress: routerAddress,
            functionName: "swapTokens",
            params: {
              tokenToSell: tokenIn.address,
              tokenToBuy: tokenOut.address,
              amountToSell: ethers.utils.parseEther(amountIn.toString()),
              minAmountToBuy: ethers.utils.parseEther((amountOut*(1-slippage)).toString())
            },
        };
      
        await runContractFunction({
            params: swapOptions,
            onSuccess: (tx) => swapTokensSuccess(tx),
            onError: () => swapTokensError(),
        });
    }

    const swapTokensError = () => {
        dispatch({
            type:"error",
            title:"Error!",
            message:"Problem swapping tokens!",
            position: "topR"
        })
    }

    const swapTokensSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type:"success",
            title:"Success!",
            message:"Tokens swapped successfully!",
            position: "topR"
        })
        getRate()
        checkBalance()
        checkAllowance()
    }

    const handleGetRateSuccess = (quote) => {
        const quoteNumber = ethers.utils.formatEther(quote)
        setExchangeRate(quoteNumber)
    }

    const handleGetRateError = () => {
        setExchangeRate(0)
    }

    const handleApproveSuccess = async (tx) => {
        await tx.wait(1)
        setTokenInApproved(amountIn)
        dispatch({
            type:"success",
            title:"Success!",
            message:"Approval successfull!",
            position: "topR"
        })
    }

    const changeAmountIn = (event) => {
        event.target.value ? setAmountIn(parseFloat(event.target.value)) : setAmountIn(0)
        setAmountOut(event.target.value*exchangeRate)
    }

    const changeAmountOut = (event) => {
        event.target.value ? setAmountOut(parseFloat(event.target.value)) : setAmountOut(0)
        setAmountIn(exchangeRate ? event.target.value/exchangeRate : 0)
    }

    const updateAmountOut = () => {
        setAmountOut(amountIn*exchangeRate)
    }

    const changeTokenOut = (event) => {
        let id = parseInt(event.id)
        setTokenOut(tokens[id])
    }

    const changeTokenIn = (event) => {
        let id = parseInt(event.id)
        setTokenIn(tokens[id])
    }

    const handleSlippageChange = (event) => {
        setTempSlippage(parseFloat(event.target.value/100))
    }

    const handleConfirmSlippageChange = () => {
        setChangingSlippage(false)
        setSlippage(tempSlippage.toFixed(3))
    }

    const handleCustomTokenA = () => {
        customTokenA && setTokenIn(tokens[0])
        setCustomTokenA(!customTokenA)
    }

    const handleCustomTokenB = () => {
        customTokenB && setTokenOut(tokens[1])
        setCustomTokenB(!customTokenB)
    }
    
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Swap tokens:</h1>
            <div className={styles.aboveTokenAContainer}>
                {tokenIn.prefix ? <span className={styles.maxToken}>Max: {tokenInBalance} {tokenIn.prefix}</span> 
                                : <span className={styles.maxToken}>Invalid token</span> }
                <SwitchTokenInputMode onClick={handleCustomTokenA} token={customTokenA}/>        
            </div>
            <div className={styles.tokenInputContainer}>
                <ChooseTokenAmount onChange={changeAmountIn} value={amountIn}/>
                {customTokenA && <ChooseCustomToken label="From" setToken={setTokenIn}/>}
                {!customTokenA && <ChooseTokenInput defaultIndex={0} onChange={changeTokenIn} label="From"/>}
            </div>
            <div className={styles.arrowContainer}>
                <span className={styles.arrow}>&#8675;</span>
                <span className={styles.rate}> {exchangeRate} {tokenOut.prefix ? tokenOut.prefix : "X"} per {tokenIn.prefix ? tokenIn.prefix : "X"}</span>
            </div>
            <div className={styles.aboveTokenBContainer}>
                <SwitchTokenInputMode onClick={handleCustomTokenB} token={customTokenB}/>        
            </div>
            <div className={styles.tokenInputContainer}>
                <ChooseTokenAmount onChange={changeAmountOut} value={amountOut}/>
                {customTokenB && <ChooseCustomToken label="To" setToken={setTokenOut}/>}
                {!customTokenB && <ChooseTokenInput defaultIndex={1} onChange={changeTokenOut} label="To"/>}
            </div>
            {!changingSlippage && 
                <div className={styles.slippage}>
                    Slippage: {slippage*100}% 
                    <span className={styles.slippageAction} onClick={() => setChangingSlippage(true)}>change</span>
                </div>
            }
            {changingSlippage && 
                <div className={styles.slippage}>
                    Slippage:  <input className={styles.slippageInput} onChange={handleSlippageChange} type="number" min={0.5} step={0.1} max={5}/>% 
                    <span className={styles.slippageAction} onClick={handleConfirmSlippageChange}>confirm</span>
                </div>
            }
            {exchangeRate === 0 && <button className={styles.disabledButton}>No liquidity</button>}
            {!amountOut && exchangeRate !== 0 && <button className={styles.disabledButton}>Choose amount</button>}
            {amountOut > 0 && exchangeRate !== 0 && tokenOutLiquidity <= parseFloat(amountOut) && <button className={styles.disabledButton}>Not enough liquidity</button>}
            {amountOut > 0 && exchangeRate !== 0 && tokenOutLiquidity > parseFloat(amountOut) && tokenInBalance < parseFloat(amountIn) && <button className={styles.disabledButton}>Insufficient balance</button>}
            {amountOut > 0 && exchangeRate !== 0 && tokenOutLiquidity > parseFloat(amountOut) && tokenInBalance >= parseFloat(amountIn) && tokenInApproved < parseFloat(amountIn) && <button className={styles.mainButton} onClick={approveTokenIn}>Approve</button>}
            {amountOut > 0 && exchangeRate !== 0 && tokenOutLiquidity > parseFloat(amountOut) && tokenInBalance >= parseFloat(amountIn) && tokenInApproved >= parseFloat(amountIn) && <button className={styles.mainButton} onClick={swapTokens}>Swap</button>}
        </div>
    )
}

export default SwapInterface;