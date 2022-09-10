import * as React from 'react'
import {useEffect, useRef, useState} from 'react'
import MDEditor from '@uiw/react-md-editor'
import {useSearchParams} from 'react-router-dom'
import Cardano from '../shared/cardano';
import {toast} from 'react-hot-toast';

function SendDonationPage() {
  const [params] = useSearchParams()
  const markdown = params.get('markdown')
  const address = params.get('address')
  const [lovelaceToSend,setLovelaceToSend]=useState<number>(0)

  const cardano=useRef(new Cardano())
    useEffect(()=>{
      cardano.current.pollWallets()
    },[])

  const sendAda=async ()=>{
    if (address){
      await toast.promise(
          cardano.current.buildSendADATransaction(address, lovelaceToSend),
          {
            loading: 'Sending transaction',
            success: <b>Transaction sent</b>,
            error: <b>Error sending transaction</b>,
          }
      );
    }
  }

  return (
    <div className='flex items-center justify-center h-screen bg-gradient-to-l from-sky-300 via-cyan-500 to-sky-400'>
      <div>
        <div className='xl:max-w-3xl p-4 bg-white rounded-lg'>
          <MDEditor.Markdown source={markdown ?? ''} />
        </div>
        <div className='grid grid-cols-2 gap-2 py-2'>
          <input
            type='number'
            onChange={(event:any)=>setLovelaceToSend(event.target.value)}
            className='w-full ºbg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            placeholder='ADA quantity'
          />

          <button
            type='button'
            onClick={sendAda}
            className='w-full text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
          >
            Donate ADA
          </button>
        </div>
      </div>
    </div>
  )
}

export default SendDonationPage
