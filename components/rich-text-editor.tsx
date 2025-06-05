"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  LinkIcon,
  ImageIcon,
  Code,
  Quote,
  Undo,
  Redo,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [linkText, setLinkText] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)

  const saveSelection = useCallback(() => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart)
      setSelectionEnd(textareaRef.current.selectionEnd)
    }
  }, [])

  const restoreSelection = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(selectionStart, selectionEnd)
    }
  }, [selectionStart, selectionEnd])

  const getSelectedText = useCallback(() => {
    return value.substring(selectionStart, selectionEnd)
  }, [value, selectionStart, selectionEnd])

  const insertText = useCallback(
    (before: string, after = "") => {
      const selectedText = getSelectedText()
      const newText = value.substring(0, selectionStart) + before + selectedText + after + value.substring(selectionEnd)

      onChange(newText)

      // Set cursor position after insertion
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = selectionStart + before.length + selectedText.length + after.length
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newPosition, newPosition)
        }
      }, 0)
    },
    [value, selectionStart, selectionEnd, getSelectedText, onChange],
  )

  const formatText = useCallback(
    (before: string, after = "") => {
      saveSelection()
      insertText(before, after)
    },
    [saveSelection, insertText],
  )

  const handleBold = () => formatText("**", "**")
  const handleItalic = () => formatText("*", "*")
  const handleH1 = () => formatText("# ")
  const handleH2 = () => formatText("## ")
  const handleH3 = () => formatText("### ")
  const handleUnorderedList = () => formatText("- ")
  const handleOrderedList = () => formatText("1. ")
  const handleBlockquote = () => formatText("> ")
  const handleCode = () => formatText("`", "`")
  const handleCodeBlock = () => formatText("\n```\n", "\n```\n")

  const handleLink = () => {
    saveSelection()
    setLinkText(getSelectedText())
    setLinkUrl("")
    setLinkDialogOpen(true)
  }

  const handleImage = () => {
    saveSelection()
    setImageAlt(getSelectedText())
    setImageUrl("")
    setImageDialogOpen(true)
  }

  const insertLink = () => {
    restoreSelection()
    insertText(`[${linkText || "link text"}](${linkUrl})`)
    setLinkDialogOpen(false)
  }

  const insertImage = () => {
    restoreSelection()
    insertText(`![${imageAlt || "image"}](${imageUrl})`)
    setImageDialogOpen(false)
  }

  const handleUndo = () => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      document.execCommand("undo")
    }
  }

  const handleRedo = () => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      document.execCommand("redo")
    }
  }

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleBold} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleItalic} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <div className="h-8 w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleH1} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleH2} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleH3} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="h-8 w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleUnorderedList}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleOrderedList}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="h-8 w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleBlockquote} title="Quote">
          <Quote className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleCode} title="Inline Code">
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCodeBlock}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
        <div className="h-8 w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleLink} title="Insert Link">
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleImage}
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <div className="h-8 w-px bg-border mx-1 ml-auto" />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleUndo} title="Undo">
          <Undo className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleRedo} title="Redo">
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={saveSelection}
        className="min-h-[300px] rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-y"
        placeholder="Write your content here using Markdown..."
      />

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkText">Link Text</Label>
              <Input
                id="linkText"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Text to display"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkUrl">URL</Label>
              <Input
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={insertLink}>Insert</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageAlt">Alt Text</Label>
              <Input
                id="imageAlt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Image description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={insertImage}>Insert</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
