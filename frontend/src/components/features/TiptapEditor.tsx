import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Table as TableIcon,
  ImageIcon,
  Highlighter,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Eye,
  Edit3,
  Smile,
  Keyboard,
  Upload,
  Pin,
  PinOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/services/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
  showCharacterCount?: boolean;
  showWordCount?: boolean;
  maxCharacters?: number;
  minHeight?: string;
  mode?: 'full' | 'minimal' | 'inline';
  stickyToolbar?: boolean;
}

const TiptapEditor = ({
  content,
  onChange,
  editable = true,
  placeholder = 'Start writing...',
  className,
  showToolbar = true,
  showCharacterCount = true,
  showWordCount = false,
  maxCharacters,
  minHeight = '200px',
  mode = 'full',
  stickyToolbar = false
}: TiptapEditorProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isToolbarSticky, setIsToolbarSticky] = useState(false);
  const [toolbarPinned, setToolbarPinned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Enhanced sticky toolbar functionality
  useEffect(() => {
    if (!stickyToolbar || !toolbarRef.current || !editorContainerRef.current) return;

    const handleScroll = () => {
      if (!toolbarRef.current || !editorContainerRef.current) return;

      const editorRect = editorContainerRef.current.getBoundingClientRect();
      const toolbarHeight = toolbarRef.current.offsetHeight;
      
      // Make toolbar sticky when editor is scrolled past viewport
      const shouldBeSticky = editorRect.top < 0 && editorRect.bottom > toolbarHeight;
      
      if (shouldBeSticky !== isToolbarSticky) {
        setIsToolbarSticky(shouldBeSticky);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stickyToolbar, isToolbarSticky]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent-cyan hover:text-accent-pink transition-colors cursor-pointer underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-md my-4',
        },
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-border rounded-lg overflow-hidden my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-border',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-muted/50 font-semibold text-left p-3 border-r border-border last:border-r-0',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'p-3 border-r border-border last:border-r-0',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-accent-pink/20 text-accent-pink rounded-sm px-1 py-0.5',
        },
      }),
      CharacterCount.configure({
        limit: maxCharacters,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable: editable && !isPreviewMode,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-hidden',
          'prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground',
          'prose-em:text-foreground prose-code:text-accent-purple prose-code:bg-muted/50',
          'prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:font-mono',
          'prose-blockquote:border-l-4 prose-blockquote:border-accent-pink',
          'prose-blockquote:text-muted-foreground prose-blockquote:italic',
          'prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground',
          'prose-a:text-accent-cyan prose-a:no-underline hover:prose-a:text-accent-pink',
          'prose-table:border-collapse prose-table:border prose-table:border-border',
          'prose-th:border prose-th:border-border prose-th:bg-muted/50 prose-th:p-3',
          'prose-td:border prose-td:border-border prose-td:p-3',
          `min-h-[${minHeight}] p-6 border border-border rounded-lg bg-background/50`,
          'focus-within:border-accent-cyan focus-within:ring-2 focus-within:ring-accent-cyan/20',
          'transition-all duration-200',
          mode === 'minimal' ? 'p-4 min-h-[120px]' : '',
          mode === 'inline' ? 'p-2 min-h-[60px] border-0 bg-transparent' : '',
        ),
      },
    },
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
    }
  }, [editor]);

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    if (editor) {
      editor.chain().focus().insertContent(emojiData.emoji).run();
    }
    setShowEmojiPicker(false);
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }, [editor]);

  const setTextAlign = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (editor) {
      editor.chain().focus().setTextAlign(alignment).run();
    }
  }, [editor]);

  const setTextColor = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
    }
    setShowColorPicker(false);
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
    variant = 'default'
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
    variant?: 'default' | 'color';
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'h-9 w-9 p-0 rounded-lg transition-all duration-200',
        'hover:bg-accent-pink/10 hover:text-accent-pink hover:scale-105',
        isActive ? 'bg-gradient-to-r from-accent-pink/20 to-accent-purple/20 text-accent-pink shadow-xs' : '',
        disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : '',
        variant === 'color' ? 'h-8 w-8' : ''
      )}
    >
      {children}
    </Button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-border/50 mx-1" />
  );

  const KeyboardShortcutsDialog = () => (
    <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Text Formatting</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>Bold</span>
              <span className="text-muted-foreground">Ctrl + B</span>
              <span>Italic</span>
              <span className="text-muted-foreground">Ctrl + I</span>
              <span>Strikethrough</span>
              <span className="text-muted-foreground">Ctrl + Shift + S</span>
              <span>Code</span>
              <span className="text-muted-foreground">Ctrl + `</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Structure</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>Heading 1</span>
              <span className="text-muted-foreground">Ctrl + Alt + 1</span>
              <span>Heading 2</span>
              <span className="text-muted-foreground">Ctrl + Alt + 2</span>
              <span>Bullet List</span>
              <span className="text-muted-foreground">Ctrl + Shift + 8</span>
              <span>Numbered List</span>
              <span className="text-muted-foreground">Ctrl + Shift + 7</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const ColorPicker = ({ onColorSelect }: { onColorSelect: (color: string) => void }) => {
    const colors = [
      { name: 'Black', value: '#000000' },
      { name: 'Gray 800', value: '#374151' },
      { name: 'Gray 600', value: '#6B7280' },
      { name: 'Gray 400', value: '#9CA3AF' },
      { name: 'Red', value: '#EF4444' },
      { name: 'Orange', value: '#F97316' },
      { name: 'Yellow', value: '#EAB308' },
      { name: 'Green', value: '#22C55E' },
      { name: 'Blue', value: '#3B82F6' },
      { name: 'Purple', value: '#8B5CF6' },
      { name: 'Pink', value: '#EC4899' },
      { name: 'Cyan', value: '#06B6D4' }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="p-3 bg-background border border-border rounded-lg shadow-lg"
      >
        <div className="grid grid-cols-6 gap-2">
          {colors.map((color) => (
            <TooltipProvider key={color.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onColorSelect(color.value)}
                    className="w-8 h-8 rounded-sm border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{color.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </motion.div>
    );
  };

  const getCharacterCount = () => {
    if (!editor) return { characters: 0, words: 0 };
    const characters = editor.storage.characterCount?.characters() || 0;
    const words = editor.storage.characterCount?.words() || 0;
    return { characters, words };
  };

  const isAtLimit = () => {
    if (!maxCharacters || !editor) return false;
    return getCharacterCount().characters >= maxCharacters;
  };

  const { characters, words } = getCharacterCount();

  return (
    <div className="w-full space-y-2" ref={editorContainerRef}>
      {/* Enhanced Bubble Menu with animations */}
      {editor && (
        <AnimatePresence>
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100, placement: 'top' }}
            className="bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-xl p-2 flex items-center gap-1"
          >
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              title="Highlight"
            >
              <Highlighter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={addLink}
              isActive={editor.isActive('link')}
              title="Add Link"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
          </BubbleMenu>
        </AnimatePresence>
      )}

      {/* Enhanced Floating Menu with animations */}
      {editor && (
        <AnimatePresence>
          <FloatingMenu
            editor={editor}
            tippyOptions={{ duration: 100, placement: 'left' }}
            className="bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-xl p-2 flex flex-col gap-1"
          >
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Type className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
          </FloatingMenu>
        </AnimatePresence>
      )}

      {/* Enhanced Main Toolbar */}
      {editable && showToolbar && mode !== 'inline' && (
        <div 
          ref={toolbarRef}
          className={cn(
            "border border-border bg-gradient-to-r from-muted/30 to-muted/20 backdrop-blur-sm transition-all duration-200",
            isToolbarSticky || toolbarPinned 
              ? "fixed top-0 left-0 right-0 z-40 rounded-none border-b shadow-lg" 
              : "rounded-t-xl"
          )}
        >
          <div className="p-3 flex flex-wrap items-center gap-2">
            {/* History Controls */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="h-4 w-4" />
              </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Text Formatting */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Inline Code"
              >
                <Code className="h-4 w-4" />
              </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Headings */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
              >
                <span className="text-xs font-bold">H1</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                <span className="text-xs font-bold">H2</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
              >
                <span className="text-xs font-bold">H3</span>
              </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Lists and Quotes */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Text Alignment */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => setTextAlign('left')}
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => setTextAlign('center')}
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => setTextAlign('right')}
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Media and Special Elements */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={addLink}
                isActive={editor.isActive('link')}
                title="Add Link"
              >
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={addImage}
                title="Add Image"
              >
                <ImageIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={addTable}
                title="Add Table"
              >
                <TableIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal Rule"
              >
                <Minus className="h-4 w-4" />
              </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* New Media Controls */}
            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <ToolbarButton
                onClick={() => fileInputRef.current?.click()}
                title="Upload Image"
              >
                <Upload className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Insert Emoji"
              >
                <Smile className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => setShowKeyboardShortcuts(true)}
                title="Keyboard Shortcuts"
              >
                <Keyboard className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Color and Highlight */}
            <div className="flex items-center gap-1 relative">
              <ToolbarButton
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Text Color"
                variant="color"
              >
                <Palette className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                isActive={editor.isActive('highlight')}
                title="Highlight"
              >
                <Highlighter className="h-4 w-4" />
              </ToolbarButton>

              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 z-50">
                  <ColorPicker onColorSelect={setTextColor} />
                </div>
              )}
            </div>

            {/* Sticky Toolbar Toggle */}
            {stickyToolbar && (
              <>
                <ToolbarDivider />
                <ToolbarButton
                  onClick={() => setToolbarPinned(!toolbarPinned)}
                  isActive={toolbarPinned}
                  title={toolbarPinned ? "Unpin Toolbar" : "Pin Toolbar"}
                >
                  {toolbarPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                </ToolbarButton>
              </>
            )}

            {/* Preview Toggle */}
            {mode === 'full' && (
              <>
                <ToolbarDivider />
                <ToolbarButton
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  isActive={isPreviewMode}
                  title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
                >
                  {isPreviewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </ToolbarButton>
              </>
            )}
          </div>

          {/* Bottom Row - Status and Stats */}
          {(showCharacterCount || showWordCount) && (
            <div className="px-3 py-2 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                {showCharacterCount && (
                  <div className={cn(
                    "flex items-center gap-1",
                    isAtLimit() ? "text-destructive" : ""
                  )}>
                    <span>Characters: {characters}</span>
                    {maxCharacters && <span>/ {maxCharacters}</span>}
                  </div>
                )}
                {showWordCount && (
                  <div>Words: {words}</div>
                )}
              </div>

              {isPreviewMode && (
                <div className="text-accent-cyan font-medium">
                  Preview Mode
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Editor Content */}
      <div className={cn(
        "relative",
        editable && showToolbar && mode !== 'inline' ? 'border-t-0 rounded-t-none' : ''
      )}>
        <EditorContent
          editor={editor}
          className={cn(
            "transition-all duration-200",
            editable && showToolbar && mode !== 'inline' ? 'border border-t-0 border-border rounded-b-xl' : '',
            mode === 'inline' ? 'border-0' : '',
            isAtLimit() ? 'ring-2 ring-destructive/20' : '',
            // Add top padding when toolbar is sticky
            (isToolbarSticky || toolbarPinned) ? "pt-16" : ""
          )}
        />

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 z-50"
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character limit warning */}
        {isAtLimit() && maxCharacters && (
          <div className="absolute bottom-2 right-2 bg-destructive/10 text-destructive text-xs px-2 py-1 rounded-lg border border-destructive/20">
            Character limit reached
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog />

      {/* Minimal mode stats */}
      {mode === 'minimal' && (showCharacterCount || showWordCount) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-4">
            {showCharacterCount && (
              <div className={cn(
                "flex items-center gap-1",
                isAtLimit() ? "text-destructive" : ""
              )}>
                <span>Characters: {characters}</span>
                {maxCharacters && <span>/ {maxCharacters}</span>}
              </div>
            )}
            {showWordCount && (
              <div>Words: {words}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TiptapEditor; 