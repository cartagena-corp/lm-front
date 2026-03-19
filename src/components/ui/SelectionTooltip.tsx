'use client'

import React, { useState } from 'react'
import {
    BoldIcon,
    ItalicIcon,
    StrikethroughIcon,
    CodeIcon,
    UnderlineIcon,
    PaletteIcon,
    HighlighterIcon,
    RemoveFormatIcon
} from '@/assets/Icon'
import { TooltipPosition } from '@/lib/types/types'

interface SelectionTooltipProps {
    position: TooltipPosition
    onFormatClick: (type: string) => void
    onColorSelect: (color: string) => void
    onHighlightSelect: (hex: string) => void
    onRemoveFormat: () => void
    colors: { name: string; hex: string }[]
    activeTextColor: string | null
    activeHighlightColor: string | null
}

export default function SelectionTooltip({ 
    position, 
    onFormatClick, 
    onColorSelect, 
    onHighlightSelect,
    onRemoveFormat,
    colors,
    activeTextColor,
    activeHighlightColor
}: SelectionTooltipProps) {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showHighlightPicker, setShowHighlightPicker] = useState(false)

    const formatButtons = [
        { icon: BoldIcon, type: 'bold', label: 'Negrita', command: 'bold' },
        { icon: ItalicIcon, type: 'italic', label: 'Cursiva', command: 'italic' },
        { icon: StrikethroughIcon, type: 'strikethrough', label: 'Tachado', command: 'strikeThrough' },
        { icon: CodeIcon, type: 'code', label: 'Código' },
        { icon: UnderlineIcon, type: 'underline', label: 'Subrayado', command: 'underline' },
    ]

    // Check if format is active
    const isFormatActive = (command: string): boolean => {
        if (typeof window === 'undefined') return false
        try {
            return document.queryCommandState(command)
        } catch {
            return false
        }
    }

    // Check if code is active
    const isCodeActive = (): boolean => {
        if (typeof window === 'undefined') return false
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return false
        
        let node = selection.anchorNode
        while (node) {
            if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'CODE') {
                return true
            }
            node = node.parentNode
        }
        return false
    }

    const isButtonActive = (type: string, command?: string): boolean => {
        if (type === 'code') {
            return isCodeActive()
        }
        if (command) {
            return isFormatActive(command)
        }
        return false
    }

    return (
        <div
            className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center gap-1"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`
            }}
        >
            {formatButtons.map((btn, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => onFormatClick(btn.type)}
                    className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${
                        isButtonActive(btn.type, btn.command) ? 'bg-gray-200 text-blue-600' : ''
                    }`}
                    title={btn.label}
                >
                    <btn.icon size={14} />
                </button>
            ))}

            {/* Color picker */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => {
                        setShowColorPicker(!showColorPicker)
                        setShowHighlightPicker(false)
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors relative flex items-center justify-center"
                    title="Color"
                >
                    {activeTextColor ? (
                        <div 
                            className="w-3.5 h-3.5 rounded-full border border-black"
                            style={{ backgroundColor: activeTextColor }}
                        />
                    ) : (
                        <PaletteIcon size={14} />
                    )}
                </button>
                {showColorPicker && (
                    <div className="absolute w-40 top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1.5">
                        {colors.map(color => (
                            <button
                                key={color.name}
                                type="button"
                                onClick={() => {
                                    onColorSelect(color.name)
                                    setShowColorPicker(false)
                                }}
                                className="w-5 h-5 rounded hover:scale-110 transition-transform border border-gray-300"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Highlight picker */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => {
                        setShowHighlightPicker(!showHighlightPicker)
                        setShowColorPicker(false)
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors relative"
                    title="Resaltado"
                >
                    <HighlighterIcon size={14} />
                    {activeHighlightColor && (
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            width={14} 
                            height={14} 
                            className="absolute top-1.5 left-1.5"
                        >
                            <path 
                                d="m9 11-6 6v3h9l3-3" 
                                fill={activeHighlightColor}
                                stroke="#000000"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </button>
                {showHighlightPicker && (
                    <div className="absolute w-40 top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1.5">
                        {colors.map(color => (
                            <button
                                key={color.name}
                                type="button"
                                onClick={() => {
                                    onHighlightSelect(color.hex)
                                    setShowHighlightPicker(false)
                                }}
                                className="w-5 h-5 rounded hover:scale-110 transition-transform border border-gray-300"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Remove format button */}
            <div className="border-l border-gray-200 pl-1 ml-1">
                <button
                    type="button"
                    onClick={onRemoveFormat}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors text-red-500"
                    title="Limpiar formato"
                >
                    <RemoveFormatIcon size={14} />
                </button>
            </div>
        </div>
    )
}
