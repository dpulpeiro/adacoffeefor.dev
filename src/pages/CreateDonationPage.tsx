import * as React from 'react'
import MDEditor from '@uiw/react-md-editor'
import { buildMarkdown, buildUrl, isValidAddress, isValidUrl } from '../shared/utils'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

const defaultMsg =
  '# Project name \n\n' +
  '>> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ' +
  'eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
  'Magna sit amet purus gravida quis blandit. Pharetra massa massa ultricies mi.' +
  ' Morbi blandit cursus risus at ultrices mi tempus. \n\n' +
  '>>>> <img class="inline" src="/social/linkedin.png"/> ' +
  ' [Linkedin](https://www.linkedin.com/in/daniel-garc%C3%ADa-pulpeiro/)\n\n' +
  '>>>> <img class="inline" src="/social/github.png"/>' +
  ' [Github](https://github.com/dpulpeiro) \n\n\n' +
  '>>### Anything you want to link'

function CreateDonationMessage() {
  const [address, setAddress] = React.useState<string>('')
  const [value, setValue] = React.useState<string | undefined>(defaultMsg)

  const buildValidateURL = () => {
    if (!isValidAddress(address)) {
      toast.error('Invalid address')
      return
    }
    if (value === undefined) {
      toast.error('Invalid markdown')
      return
    }
    const url = buildUrl(address, value)

    if (!isValidUrl(url)) {
      toast.error('Markdown content too long')
    }
    return url
  }
  const copyMarkdownLinkToClipboard = () => {
    const url = buildValidateURL()
    if (url) {
      const markdownContent = buildMarkdown(url)
      navigator.clipboard.writeText(markdownContent)
      toast.success('Copied markdown link')
    }
  }
  const openLinkNewWindow = () => {
    const url = buildValidateURL()
    if (url) {
      window.open(url)
    }
  }
  return (
    <div className='flex items-center justify-center h-screen bg-gradient-to-l from-sky-300 via-cyan-500 to-sky-400'>
      <div>
        <div>
          <div>
            <input
              type='text'
              id='first_name'
              className='bg-gray-50 border my-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder='Your Cardano Wallet address'
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
        </div>
        <div>
          <MDEditor
            height={600}
            className='max-h-screen h-full'
            value={value}
            onChange={setValue}
          />
        </div>
        <div className='flex flex-row mt-2 gap-2'>
          <button
            type='button'
            onClick={copyMarkdownLinkToClipboard}
            className='grow text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
          >
            Copy Markdown
          </button>
          <button
            type='button'
            onClick={openLinkNewWindow}
            className='grow text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
          >
            Red to Yellow
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateDonationMessage
