'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XIcon } from '../../assets/Icon'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  customWidth?: string
  showCloseButton?: boolean
  removePadding?: boolean
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  customWidth = "sm:max-w-lg", 
  showCloseButton = true, 
  removePadding = false 
}: ModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-lg transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`relative transform overflow-visible rounded-lg bg-white 
              text-left shadow-xl transition-all sm:my-8 sm:w-full ${customWidth} ${
                removePadding ? '' : 'px-4 pb-4 pt-5 sm:p-6'
              }`}>
                {!removePadding && (
                  <div className='flex justify-between items-center'>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    {showCloseButton && (
                      <button
                        type="button"
                        className="bg-white text-gray-400 hover:text-gray-700 rounded-md cursor-pointer"
                        onClick={onClose}
                      >
                        <XIcon />
                      </button>
                    )}
                  </div>
                )}
                {removePadding && showCloseButton && (
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      type="button"
                      className="bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 rounded-md cursor-pointer p-2 shadow-sm"
                      onClick={onClose}
                    >
                      <XIcon />
                    </button>
                  </div>
                )}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 