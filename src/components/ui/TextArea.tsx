'use client'

import { XIcon, AttachIcon, BoldIcon, ItalicIcon, StrikethroughIcon, CodeIcon, UnderlineIcon, PaletteIcon, HighlighterIcon, PlusIcon } from '@/assets/Icon'
import { TextAreaProps, TooltipPosition, TaskProps } from '@/lib/types/types'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import SelectionTooltip from './SelectionTooltip'
import { useIssueStore } from '@/lib/store/IssueStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { useConfigStore } from '@/lib/store/ConfigStore'
import DOMPurify from 'dompurify'

export default function TextArea({ title, value, onChange, files = [], onRemoveFile, onFilesChange,
    placeholder = 'Escribe aquí...',
    extensionAllowed = 'image/*',
    maxHeight = '180px',
    minHeight = '60px',
    maxLength = 5000,
    projectId,
}: TextAreaProps) {
    const [showTooltip, setShowTooltip] = useState(false)
    const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0 })
    const [dragActive, setDragActive] = useState(false)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showHighlightPicker, setShowHighlightPicker] = useState(false)
    const [activeTextColor, setActiveTextColor] = useState<string | null>(null)
    const [activeHighlightColor, setActiveHighlightColor] = useState<string | null>(null)
    const [, setForceUpdate] = useState(0) // Force re-render to update button states
    const [showIssueTooltip, setShowIssueTooltip] = useState(false)
    const [issueSearchQuery, setIssueSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(0)
    const editorRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const colorPickerRef = useRef<HTMLDivElement>(null)
    const highlightPickerRef = useRef<HTMLDivElement>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const issueTooltipRef = useRef<HTMLDivElement>(null)
    const issueScrollRef = useRef<HTMLDivElement>(null)
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)

    const { getIssues, issues, isLoading, isLoadingMore, loadMoreIssues } = useIssueStore()
    const { getValidAccessToken } = useAuthStore()
    const { projectConfig } = useConfigStore()

    const colors = [
        { name: 'Blanco', hex: '#ffffff' }, // Fila 1
        { name: 'Negro', hex: '#000000' },
        { name: 'Rojo', hex: '#FF2C2C' },
        { name: 'Azul', hex: '#155dfc' },
        { name: 'Cían', hex: '#00F0FF' },

        { name: 'Verde', hex: '#0BDA51' }, // Fila 2
        { name: 'Amarillo', hex: '#ffdd21' },
        { name: 'Naranja', hex: '#E35335' },
        { name: 'Morado', hex: '#8308b4' },
        { name: 'Rosado', hex: '#ff00ff' },
    ]

    // Initialize content
    useEffect(() => {
        const editor = editorRef.current
        if (!editor || editor.innerHTML === value) return
        editor.innerHTML = value || ''
    }, [value])

    // Get plain text length (without HTML tags)
    const getTextLength = (html: string): number => {
        if (typeof window === 'undefined') return 0
        const div = document.createElement('div')
        div.innerHTML = html
        return div.textContent?.length || 0
    }

    // Execute format command using native contentEditable commands
    const executeCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value)
        updateContent()
    }

    // Update content and sync with parent
    const updateContent = () => {
        const editor = editorRef.current
        if (!editor) return

        const html = editor.innerHTML
        const textLength = getTextLength(html)

        // If editor is empty, remove all formatting
        if (textLength === 0 || html === '<br>' || html === '') {
            editor.innerHTML = ''
            onChange('')
            return
        }

        if (textLength <= maxLength) {
            onChange(html)
        } else {
            // Revert if exceeds limit
            editor.innerHTML = value
        }
    }

    // Handle text selection to show tooltip
    const handleSelection = () => {
        if (typeof window === 'undefined') return

        const selection = window.getSelection()

        // Detect active text color and highlight color
        if (selection && !selection.isCollapsed) {
            const range = selection.getRangeAt(0)
            const parentElement = range.commonAncestorContainer.parentElement

            if (parentElement) {
                // Get computed styles
                const computedStyle = window.getComputedStyle(parentElement)
                const textColor = computedStyle.color
                const bgColor = computedStyle.backgroundColor

                // Convert rgb to hex
                const rgbToHex = (rgb: string): string => {
                    const result = rgb.match(/\d+/g)
                    if (!result) return ''
                    const [r, g, b] = result.map(Number)
                    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
                }

                // Check if text color matches any of our colors
                const hexTextColor = rgbToHex(textColor)
                const matchingTextColor = colors.find(c => c.hex.toLowerCase() === hexTextColor.toLowerCase())
                setActiveTextColor(matchingTextColor ? matchingTextColor.hex : null)

                // Check if background color matches any of our colors (not transparent)
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                    const hexBgColor = rgbToHex(bgColor)
                    const matchingBgColor = colors.find(c => c.hex.toLowerCase() === hexBgColor.toLowerCase())
                    setActiveHighlightColor(matchingBgColor ? matchingBgColor.hex : null)
                } else {
                    setActiveHighlightColor(null)
                }
            }
        } else {
            // When no selection, detect from cursor position
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                const parentElement = range.commonAncestorContainer.parentElement

                if (parentElement) {
                    const computedStyle = window.getComputedStyle(parentElement)
                    const textColor = computedStyle.color
                    const bgColor = computedStyle.backgroundColor

                    const rgbToHex = (rgb: string): string => {
                        const result = rgb.match(/\d+/g)
                        if (!result) return ''
                        const [r, g, b] = result.map(Number)
                        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
                    }

                    const hexTextColor = rgbToHex(textColor)
                    const matchingTextColor = colors.find(c => c.hex.toLowerCase() === hexTextColor.toLowerCase())
                    setActiveTextColor(matchingTextColor ? matchingTextColor.hex : null)

                    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                        const hexBgColor = rgbToHex(bgColor)
                        const matchingBgColor = colors.find(c => c.hex.toLowerCase() === hexBgColor.toLowerCase())
                        setActiveHighlightColor(matchingBgColor ? matchingBgColor.hex : null)
                    } else {
                        setActiveHighlightColor(null)
                    }
                }
            }
        }

        // Force re-render to update button states
        setForceUpdate(prev => prev + 1)

        if (!selection || selection.isCollapsed) {
            setShowTooltip(false)
            return
        }

        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        const containerRect = containerRef.current?.getBoundingClientRect()

        if (containerRect && rect.width > 0) {
            setTooltipPosition({
                top: rect.top - containerRect.top - 50,
                left: rect.left - containerRect.left + (rect.width / 2)
            })
            setShowTooltip(true)
        }
    }

    // Check if format is currently applied
    const isFormatActive = (command: string): boolean => {
        if (typeof window === 'undefined') return false
        try {
            return document.queryCommandState(command)
        } catch {
            return false
        }
    }

    // Check if selection is inside a <code> tag
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

    // Apply formats using native commands (with toggle)
    const applyBold = () => executeCommand('bold')
    const applyItalic = () => executeCommand('italic')
    const applyUnderline = () => executeCommand('underline')
    const applyStrikethrough = () => executeCommand('strikeThrough')

    const applyColor = (color: string) => {
        executeCommand('foreColor', color)
        setShowColorPicker(false)
        // Force update to reflect color changes in tooltip
        setTimeout(() => setForceUpdate(prev => prev + 1), 10)
    }

    const applyHighlight = (color: string) => {
        executeCommand('backColor', color)
        setShowHighlightPicker(false)
        // Force update to reflect color changes in tooltip
        setTimeout(() => setForceUpdate(prev => prev + 1), 10)
    }

    const removeFormat = () => {
        executeCommand('removeFormat')
        executeCommand('unlink')
        // Force update to reflect changes
        setTimeout(() => setForceUpdate(prev => prev + 1), 10)
    }

    const applyCode = () => {
        if (typeof window === 'undefined') return

        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        // Check if already in code tag
        if (isCodeActive()) {
            // Remove code formatting
            const range = selection.getRangeAt(0)
            let node = selection.anchorNode

            while (node && node !== editorRef.current) {
                if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'CODE') {
                    const parent = node.parentNode
                    if (parent) {
                        // Replace code node with its text content
                        const textNode = document.createTextNode(node.textContent || '')
                        parent.replaceChild(textNode, node)
                        updateContent()
                    }
                    break
                }
                node = node.parentNode
            }
        } else {
            // Apply code formatting
            const range = selection.getRangeAt(0)
            const selectedText = range.toString()

            if (selectedText) {
                const code = document.createElement('code')
                code.textContent = selectedText
                range.deleteContents()
                range.insertNode(code)
                updateContent()
            }
        }
    }

    // Format button handlers
    const handleFormatClick = (type: string) => {
        if (typeof window === 'undefined') return

        const editor = editorRef.current
        if (!editor) return

        // Focus the editor first
        editor.focus()

        switch (type) {
            case 'bold': applyBold(); break
            case 'italic': applyItalic(); break
            case 'underline': applyUnderline(); break
            case 'strikethrough': applyStrikethrough(); break
            case 'code': applyCode(); break
        }

        // Don't close tooltip - let the selectionchange listener handle it

        // Force update after a short delay to reflect changes
        setTimeout(() => setForceUpdate(prev => prev + 1), 10)
    }

    const handleColorSelect = (colorName: string) => {
        const color = colors.find(c => c.name === colorName)
        if (color) applyColor(color.hex)
    }

    const handleHighlightSelect = (hex: string) => {
        applyHighlight(hex)
    }

    // Format buttons configuration
    const formatButtons = [
        { icon: BoldIcon, type: 'bold', label: 'Negrita', command: 'bold' },
        { icon: ItalicIcon, type: 'italic', label: 'Cursiva', command: 'italic' },
        { icon: StrikethroughIcon, type: 'strikethrough', label: 'Tachado', command: 'strikeThrough' },
        { icon: CodeIcon, type: 'code', label: 'Código' },
        { icon: UnderlineIcon, type: 'underline', label: 'Subrayado', command: 'underline' },
    ]

    // Check if a format button is active
    const isButtonActive = (type: string, command?: string): boolean => {
        if (type === 'code') {
            return isCodeActive()
        }
        if (command) {
            return isFormatActive(command)
        }
        return false
    }

    // Handle key events to detect when editor becomes empty
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (typeof window === 'undefined') return

        const editor = editorRef.current
        if (!editor) return

        // Check if Backspace or Delete is pressed
        if (e.key === 'Backspace' || e.key === 'Delete') {
            const selection = window.getSelection()
            
            // Handle deletion of issue badge (contenteditable="false" spans)
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                let node = range.startContainer

                // Check if we're next to or inside a contenteditable="false" element
                let badgeElement: Element | null = null

                // If we're in a text node, check its siblings
                if (node.nodeType === Node.TEXT_NODE) {
                    if (e.key === 'Backspace' && range.startOffset === 0) {
                        // Cursor at start of text node, check previous sibling
                        const prevSibling = node.previousSibling
                        if (prevSibling && prevSibling.nodeType === Node.ELEMENT_NODE) {
                            const element = prevSibling as Element
                            if (element.getAttribute('contenteditable') === 'false') {
                                badgeElement = element
                            }
                        }
                    } else if (e.key === 'Delete' && range.startOffset === node.textContent?.length) {
                        // Cursor at end of text node, check next sibling
                        const nextSibling = node.nextSibling
                        if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE) {
                            const element = nextSibling as Element
                            if (element.getAttribute('contenteditable') === 'false') {
                                badgeElement = element
                            }
                        }
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element
                    if (element.getAttribute('contenteditable') === 'false') {
                        badgeElement = element
                    } else {
                        // Check children at cursor position
                        const childNodes = Array.from(element.childNodes)
                        const offset = range.startOffset

                        if (e.key === 'Backspace' && offset > 0) {
                            const prevChild = childNodes[offset - 1]
                            if (prevChild && prevChild.nodeType === Node.ELEMENT_NODE) {
                                const prevElement = prevChild as Element
                                if (prevElement.getAttribute('contenteditable') === 'false') {
                                    badgeElement = prevElement
                                }
                            }
                        } else if (e.key === 'Delete' && offset < childNodes.length) {
                            const nextChild = childNodes[offset]
                            if (nextChild && nextChild.nodeType === Node.ELEMENT_NODE) {
                                const nextElement = nextChild as Element
                                if (nextElement.getAttribute('contenteditable') === 'false') {
                                    badgeElement = nextElement
                                }
                            }
                        }
                    }
                }

                // If we found a badge element, remove it
                if (badgeElement) {
                    e.preventDefault()
                    badgeElement.remove()
                    updateContent()
                    return
                }
            }

            const currentText = getTextLength(editor.innerHTML)

            // If only 1 character left (or less), clear all formats on next update
            if (currentText <= 1) {
                setTimeout(() => {
                    const newText = getTextLength(editor.innerHTML)
                    if (newText === 0) {
                        // Clear all formats
                        try {
                            document.execCommand('removeFormat', false, undefined)

                            // Toggle off all formats that might be active
                            if (isFormatActive('bold')) document.execCommand('bold', false, undefined)
                            if (isFormatActive('italic')) document.execCommand('italic', false, undefined)
                            if (isFormatActive('underline')) document.execCommand('underline', false, undefined)
                            if (isFormatActive('strikeThrough')) document.execCommand('strikeThrough', false, undefined)

                            setForceUpdate(prev => prev + 1)
                        } catch (error) {
                            // Ignore errors
                        }
                    }
                }, 0)
            }
        }
    }

    // Handle paste event
    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault()

        if (e.clipboardData && e.clipboardData.items) {
            const items = Array.from(e.clipboardData.items)
            const imageFiles: File[] = []

            items.forEach(item => {
                if (item.kind === 'file') {
                    const file = item.getAsFile()
                    if (file) {
                        // Si extensionAllowed es "image/*", solo aceptar imágenes
                        if (extensionAllowed === 'image/*' && file.type.startsWith('image/')) {
                            imageFiles.push(file)
                        } else if (extensionAllowed !== 'image/*') {
                            // Para otros tipos, aceptar todos los archivos
                            imageFiles.push(file)
                        }
                    }
                }
            })

            if (imageFiles.length > 0 && onFilesChange) {
                onFilesChange([...files, ...imageFiles])
                return
            }
        }

        // Handle text paste
        const pastedText = e.clipboardData.getData('text/plain')
        if (pastedText) {
            document.execCommand('insertText', false, pastedText)
            updateContent()
        }
    }

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
        ) {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragActive(false)

        const dropped = Array.from(e.dataTransfer.files)

        // Si extensionAllowed es "image/*", filtrar solo imágenes
        if (extensionAllowed === 'image/*') {
            const imageFiles = dropped.filter(file => file.type.startsWith('image/'))
            if (imageFiles.length > 0 && onFilesChange) {
                onFilesChange([...files, ...imageFiles])
            }
        } else {
            // Para otros tipos de extensiones, permitir todos los archivos
            if (dropped.length > 0 && onFilesChange) {
                onFilesChange([...files, ...dropped])
            }
        }
    }

    // Handle file input
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && onFilesChange) {
            const selectedFiles = Array.from(e.target.files)

            // Si extensionAllowed es "image/*", filtrar solo imágenes
            if (extensionAllowed === 'image/*') {
                const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'))
                if (imageFiles.length > 0) {
                    onFilesChange([...files, ...imageFiles])
                }
            } else {
                // Para otros tipos de extensiones, permitir todos los archivos seleccionados
                onFilesChange([...files, ...selectedFiles])
            }
        }
    }

    // Handle issue tooltip
    const handleIssueTooltipToggle = async () => {
        if (!projectId) return

        const newShowState = !showIssueTooltip
        setShowIssueTooltip(newShowState)

        if (newShowState) {
            setCurrentPage(0)
            setIssueSearchQuery('')
            try {
                const token = await getValidAccessToken()
                await getIssues(token, projectId, { page: 0, size: 10 })
            } catch (error) {
                console.error('Error loading issues:', error)
            }
        }
    }

    // Handle issue search with debounce
    const handleIssueSearch = useCallback((query: string) => {
        if (!projectId) return

        // Update the search query immediately for UI feedback
        setIssueSearchQuery(query)

        // Clear existing timeout
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current)
        }

        // Set new timeout for API call (1 second debounce)
        searchDebounceRef.current = setTimeout(async () => {
            setCurrentPage(0)
            
            try {
                const token = await getValidAccessToken()
                await getIssues(token, projectId, {
                    keyword: query || undefined,
                    page: 0,
                    size: 10
                })
            } catch (error) {
                console.error('Error searching issues:', error)
            }
        }, 1000)
    }, [projectId, getValidAccessToken, getIssues])

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current)
            }
        }
    }, [])

    // Handle infinite scroll for issues
    const handleIssueScroll = useCallback(async () => {
        if (!projectId || isLoadingMore || !issueScrollRef.current) return

        const { scrollTop, scrollHeight, clientHeight } = issueScrollRef.current

        if (scrollTop + clientHeight >= scrollHeight - 50 && currentPage + 1 < issues.totalPages) {
            const nextPage = currentPage + 1
            setCurrentPage(nextPage)

            try {
                const token = await getValidAccessToken()
                await loadMoreIssues(token, projectId, {
                    keyword: issueSearchQuery || undefined,
                    page: nextPage,
                    size: 10
                })
            } catch (error) {
                console.error('Error loading more issues:', error)
            }
        }
    }, [projectId, isLoadingMore, currentPage, issues.totalPages, issueSearchQuery, getValidAccessToken, loadMoreIssues])

    // Handle issue selection
    const handleIssueSelect = (issue: TaskProps) => {
        if (!editorRef.current || typeof window === 'undefined' || !projectId) return

        // Get issue type info for the color
        const issueType = projectConfig?.issueTypes?.find((t: any) => t.id === issue.type)
        const typeColor = issueType?.color || '#6B7280'

        // Sanitize issue title to prevent XSS
        const sanitizedTitle = DOMPurify.sanitize(issue.title, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
            KEEP_CONTENT: true
        })

        // Validate and sanitize color (must be a valid hex color)
        const sanitizedColor = /^#[0-9A-Fa-f]{6}$/.test(typeColor) ? typeColor : '#6B7280'

        // Validate projectId and issue.id (must be alphanumeric or UUID)
        const isValidId = (id: string | number | undefined): id is string | number => {
            if (!id) return false
            return /^[a-zA-Z0-9-_]+$/.test(String(id))
        }
        
        if (!isValidId(projectId) || !isValidId(issue.id)) {
            console.error('Invalid projectId or issueId')
            return
        }

        // Create a non-editable badge element with link
        const issueLink = `<span contenteditable="false" class="issue-badge"><span class="issue-badge-line" style="background:${sanitizedColor}"></span><a href="/tableros/${projectId}/${issue.id}" target="_blank" rel="noopener noreferrer">${sanitizedTitle}</a></span>&nbsp;`

        // Sanitize the complete HTML before insertion
        const sanitizedLink = DOMPurify.sanitize(issueLink, {
            ALLOWED_TAGS: ['span', 'a'],
            ALLOWED_ATTR: ['contenteditable', 'class', 'style', 'href', 'target', 'rel'],
            ALLOW_DATA_ATTR: false
        })

        editorRef.current.focus()
        document.execCommand('insertHTML', false, sanitizedLink)
        updateContent()
        setShowIssueTooltip(false)
    }

    // Close color pickers when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setShowColorPicker(false)
            }
            if (highlightPickerRef.current && !highlightPickerRef.current.contains(event.target as Node)) {
                setShowHighlightPicker(false)
            }
            if (issueTooltipRef.current && !issueTooltipRef.current.contains(event.target as Node)) {
                setShowIssueTooltip(false)
            }

            // Close tooltip when clicking outside of it and outside the editor
            if (showTooltip &&
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target as Node) &&
                editorRef.current &&
                !editorRef.current.contains(event.target as Node)) {
                setShowTooltip(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showTooltip])

    // Close tooltip when selection is cleared
    useEffect(() => {
        const handleSelectionChange = () => {
            if (typeof window === 'undefined') return

            const selection = window.getSelection()
            if (!selection || selection.isCollapsed) {
                setShowTooltip(false)
            }
        }

        document.addEventListener('selectionchange', handleSelectionChange)
        return () => document.removeEventListener('selectionchange', handleSelectionChange)
    }, [])

    return (
        <div className="flex flex-col">
            {/* Title */}
            <label className="text-gray-900 text-sm font-semibold block mb-2">
                {title}
            </label>

            {/* Toolbar */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-t-lg px-3 py-2">
                <div className="flex items-center gap-1">
                    {/* Format buttons */}
                    {formatButtons.map((btn, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleFormatClick(btn.type)}
                            className={`p-2 hover:bg-gray-200 rounded transition-colors ${isButtonActive(btn.type, btn.command) ? 'bg-gray-300 text-blue-600' : ''
                                }`}
                            title={btn.label}
                        >
                            <btn.icon size={16} />
                        </button>
                    ))}

                    {/* Color picker */}
                    <div className="relative" ref={colorPickerRef}>
                        <button
                            type="button"
                            onClick={() => {
                                setShowColorPicker(!showColorPicker)
                                setShowHighlightPicker(false)
                            }}
                            className="p-2 hover:bg-gray-200 rounded transition-colors relative flex items-center justify-center"
                            title="Color de texto"
                        >
                            {activeTextColor ? (
                                <div
                                    className="w-4 h-4 rounded-full border border-black"
                                    style={{ backgroundColor: activeTextColor }}
                                />
                            ) : (
                                <PaletteIcon size={16} />
                            )}
                        </button>
                        {showColorPicker && (
                            <div className="absolute w-40 top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 grid grid-cols-5 gap-1.5">
                                {colors.map(color => (
                                    <button
                                        key={color.name}
                                        type="button"
                                        onClick={() => handleColorSelect(color.name)}
                                        className="w-6 h-6 rounded hover:scale-110 transition-transform border border-gray-300"
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Highlight picker */}
                    <div className="relative" ref={highlightPickerRef}>
                        <button
                            type="button"
                            onClick={() => {
                                setShowHighlightPicker(!showHighlightPicker)
                                setShowColorPicker(false)
                            }}
                            className="p-2 hover:bg-gray-200 rounded transition-colors relative"
                            title="Resaltado"
                        >
                            <HighlighterIcon size={16} />
                            {activeHighlightColor && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width={16}
                                    height={16}
                                    className="absolute top-2 left-2"
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
                            <div className="absolute w-40 top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 grid grid-cols-5 gap-1.5">
                                {colors.map(color => (
                                    <button
                                        key={color.name}
                                        type="button"
                                        onClick={() => handleHighlightSelect(color.hex)}
                                        className="w-6 h-6 rounded hover:scale-110 transition-transform border border-gray-300"
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Attach image button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Adjuntar imagen"
                    >
                        <AttachIcon size={16} stroke={1.5} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={extensionAllowed}
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Reference issue button */}
                    {projectId && (
                        <div className="relative" ref={issueTooltipRef}>
                            <button
                                type="button"
                                onClick={handleIssueTooltipToggle}
                                className="p-2 hover:bg-gray-200 rounded transition-colors text-blue-600"
                                title="Referenciar tarea"
                            >
                                <PlusIcon size={16} stroke={1.5} />
                            </button>

                            {/* Issue search tooltip */}
                            {showIssueTooltip && (
                                <div className="absolute bottom-full right-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                                    <div
                                        ref={issueScrollRef}
                                        onScroll={handleIssueScroll}
                                        className="max-h-80 overflow-y-auto border-b border-gray-200"
                                    >
                                        {isLoading && currentPage === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                Cargando issues...
                                            </div>
                                        ) : issues.content.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                No se encontraron issues
                                            </div>
                                        ) : (
                                            <>
                                                {(issues.content as TaskProps[]).map((issue) => {
                                                    const issueType = projectConfig?.issueTypes?.find((t: any) => t.id === issue.type)
                                                    const typeColor = issueType?.color || '#6B7280'
                                                    const typeName = issueType?.name || 'N/A'

                                                    return (
                                                        <button
                                                            key={issue.id}
                                                            type="button"
                                                            onClick={() => handleIssueSelect(issue)}
                                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3" title={typeName}>
                                                                <span className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: typeColor }} />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                                        {issue.title}
                                                                    </p>
                                                                    {issue.descriptions && issue.descriptions[0] && (
                                                                        <p className="text-xs text-gray-500 truncate mt-1">
                                                                            {issue.descriptions[0].title}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    )
                                                })}

                                                {isLoadingMore && (
                                                    <div className="p-3 text-center text-sm text-gray-500">
                                                        Cargando más...
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="p-3">
                                        <input
                                            type="search"
                                            placeholder="Buscar issues..."
                                            value={issueSearchQuery}
                                            onChange={(e) => handleIssueSearch(e.target.value)}
                                            className="w-full px-1 text-sm rounded-lg outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Character counter */}
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getTextLength(value) > maxLength * 0.9 ? 'bg-red-500' : getTextLength(value) > maxLength * 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <span className={`text-xs font-medium ${getTextLength(value) > maxLength * 0.9 ? 'text-red-500' : getTextLength(value) > maxLength * 0.7 ? 'text-yellow-500' : 'text-gray-500'}`}>
                        {getTextLength(value)} / {maxLength}
                    </span>
                </div>
            </div>

            {/* ContentEditable editor with live formatting */}
            <div
                ref={containerRef}
                className={`relative text-sm border border-t-0 border-gray-200 rounded-b-lg ${dragActive ? 'border-blue-500 bg-blue-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Selection Tooltip */}
                {showTooltip && (
                    <div ref={tooltipRef}>
                        <SelectionTooltip
                            position={tooltipPosition}
                            onFormatClick={handleFormatClick}
                            onColorSelect={handleColorSelect}
                            onHighlightSelect={handleHighlightSelect}
                            onRemoveFormat={removeFormat}
                            colors={colors}
                            activeTextColor={activeTextColor}
                            activeHighlightColor={activeHighlightColor}
                        />
                    </div>
                )}

                <div
                    ref={editorRef}
                    contentEditable
                    onInput={updateContent}
                    onSelect={handleSelection}
                    onMouseUp={handleSelection}
                    onKeyUp={handleSelection}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    data-placeholder={placeholder}
                    className="rounded-b-lg w-full px-4 py-3 text-xs outline-none bg-white min-h-[60px] max-h-[180px] overflow-auto break-words empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 [&_code]:font-mono [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_span[contenteditable='false']]:select-none [&_span[contenteditable='false']]:inline-flex [&_span[contenteditable='false']]:items-center [&_span[contenteditable='false']]:align-middle"
                    style={{
                        minHeight,
                        maxHeight,
                        whiteSpace: 'normal'
                    }}
                    suppressContentEditableWarning
                />

                {dragActive && (
                    <div className="absolute inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center pointer-events-none">
                        <p className="text-blue-600 font-medium">Suelta la imagen aquí</p>
                    </div>
                )}
            </div>

            {/* Attached images */}
            {files.length > 0 && (
                <div className="space-y-2 mt-2">
                    <p className="text-xs font-semibold text-gray-600">
                        {extensionAllowed === 'image/*' ? 'Imágenes adjuntas:' : 'Archivos adjuntos:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {files.map((file, index) => (
                            <div key={index} className="relative group">
                                {file.type.startsWith('image/') ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-20 h-20 object-cover rounded border border-gray-200"
                                    />
                                ) : (
                                    <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
                                        <p className="text-xs text-gray-500 text-center px-1 truncate w-full">
                                            {file.name}
                                        </p>
                                    </div>
                                )}
                                {onRemoveFile && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveFile(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <XIcon size={12} stroke={1.5} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}