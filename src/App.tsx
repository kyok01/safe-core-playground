import { useEffect, useState } from 'react'
import './App.css';
import { SafeAuthKit, Web3AuthModalPack } from '@safe-global/auth-kit';
import { Web3AuthOptions } from '@web3auth/modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import {
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
  WALLET_ADAPTERS
} from '@web3auth/base'

export interface SafeAuthSignInData {
  eoa: string
  safes?: string[]
}

function App() {
  const [safeAuthSignInResponse, setSafeAuthSignInResponse] = useState<SafeAuthSignInData>()
  const [safeAuth, setSafeAuth] = useState<SafeAuthKit<Web3AuthModalPack>>()
  const [provider, setProvider] = useState<SafeEventEmitterProvider>()

  useEffect(() => {
    (async () => {
      console.log(process.env.REACT_APP_WEB3AUTH_CLIENT_ID);
      
      const options: Web3AuthOptions = {
        clientId: process.env.REACT_APP_WEB3AUTH_CLIENT_ID || '',
        web3AuthNetwork: 'testnet',
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x13881",
          rpcTarget: 'https://polygon-mumbai-bor.publicnode.com'
        },
        uiConfig: {
          theme: 'dark',
          loginMethodsOrder: ['google', 'facebook']
        }
      }

      const modalConfig = {
        [WALLET_ADAPTERS.TORUS_EVM]: {
          label: 'torus',
          showOnModal: false
        },
        [WALLET_ADAPTERS.METAMASK]: {
          label: 'metamask',
          showOnDesktop: true,
          showOnMobile: false
        }
      }

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: 'mandatory'
        },
        adapterSettings: {
          uxMode: 'popup',
          whiteLabel: {
            name: 'Safe'
          }
        }
      })

      const pack = new Web3AuthModalPack(options, [openloginAdapter], modalConfig)

      const safeAuthKit = await SafeAuthKit.init(pack, {
        //WARNING: no endpoint for mumbai
        txServiceUrl: 'https://safe-transaction-goerli.safe.global'
      })
      setSafeAuth(safeAuthKit);
    })()
  }, [])


  const onLoginHandler = async()=>{
    if (!safeAuth) return

    const response = await safeAuth.signIn()
    console.log('SIGN IN RESPONSE: ', response)

    setSafeAuthSignInResponse(response)
    setProvider(safeAuth.getProvider() as SafeEventEmitterProvider)
  }

  const onLogoutHandler = async () => {
    if (!safeAuth) return

    await safeAuth.signOut()

    setProvider(undefined)
    setSafeAuthSignInResponse(undefined)
  }

  return (
    <div className="App">
      <button onClick={onLoginHandler}>login</button>
      <button onClick={onLogoutHandler}>logout</button>
      <h2>EOA</h2>
      <p>{safeAuthSignInResponse?.eoa}</p>
      <h2>Available safes</h2>
      {safeAuthSignInResponse?.safes?.length ? (
                safeAuthSignInResponse?.safes?.map((safe, index) => (
                  <div key={index}>
                    <p>{safe}</p>
                  </div>
                ))
              ) : (
                <p>
                  No Available Safes
                </p>
              )}
    </div>
  );
}

export default App;
