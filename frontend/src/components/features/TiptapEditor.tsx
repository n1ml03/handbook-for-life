import React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Typography } from '@tiptap/extension-typography';
import { TextAlign } from '@tiptap/extension-text-align';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
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
  Palette,
  Eye,
  Edit3,
  MoreHorizontal,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/services/utils';

// Removed tooltip imports for hover-free interface

export interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onJsonChange?: (jsonContent: any) => void; // Optional callback for JSON content
  editable?: boolean;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
  showCharacterCount?: boolean;
  showWordCount?: boolean; // Legacy prop for backward compatibility
  maxCharacters?: number;
  minHeight?: string;
  mode?: 'full' | 'minimal' | 'inline';
  stickyToolbar?: boolean; // Legacy prop for backward compatibility
}

const TiptapEditor = ({
  content,
  onChange,
  onJsonChange,
  editable = true,
  placeholder = 'Start writing...',
  className: _className,
  showToolbar = true,
  showCharacterCount = true,
  maxCharacters,
  minHeight = '200px',
  mode = 'full'
}: TiptapEditorProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker]);

  // Mode-specific configurations
  const modeConfig = {
    full: {
      showBubbleMenu: true,
      showFloatingMenu: true,
      showAdvancedTools: true,
      showPreviewToggle: true,
      showAllFormatting: true,
      showMediaTools: true,
      minToolbarHeight: 'auto'
    },
    minimal: {
      showBubbleMenu: true,
      showFloatingMenu: false,
      showAdvancedTools: false,
      showPreviewToggle: false,
      showAllFormatting: false,
      showMediaTools: false,
      minToolbarHeight: 'auto'
    },
    inline: {
      showBubbleMenu: true,
      showFloatingMenu: false,
      showAdvancedTools: false,
      showPreviewToggle: false,
      showAllFormatting: false,
      showMediaTools: false,
      minToolbarHeight: 'none'
    }
  };

  const currentConfig = modeConfig[mode];

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable horizontal rule in StarterKit since we're using the standalone extension
        horizontalRule: false,
        // Disable link in StarterKit since we're using a custom Link configuration
        link: false,
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-4 border-t-2 border-border',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent-cyan cursor-pointer underline',
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
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
        includeChildren: true,
        emptyEditorClass: 'is-editor-empty',
      }),
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable: editable && !isPreviewMode,
    onUpdate: ({ editor }) => {
      // Send HTML content for display
      const htmlContent = editor.getHTML();
      onChange(htmlContent);

      // Send JSON content if callback is provided
      if (onJsonChange) {
        const jsonContent = editor.getJSON();
        onJsonChange(jsonContent);
      }
    },
    onCreate: ({ editor }) => {
      // Ensure the editor is ready for immediate interaction
      if (editable && !isPreviewMode) {
        editor.setEditable(true);
      }
    },
    onFocus: ({ editor }) => {
      // Ensure the editor is in edit mode when focused
      if (editable && !isPreviewMode) {
        editor.setEditable(true);
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none',
          // Text and content rendering
          'prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground',
          'prose-em:text-foreground prose-code:text-accent-purple prose-code:bg-accent-purple/10',
          'prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:font-mono prose-code:text-sm',
          'prose-blockquote:border-l-4 prose-blockquote:border-accent-pink prose-blockquote:bg-accent-pink/5',
          'prose-blockquote:text-muted-foreground prose-blockquote:italic prose-blockquote:pl-4 prose-blockquote:py-2',
          'prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground',
          'prose-a:text-accent-cyan prose-a:no-underline',
          // Table styling
          'prose-table:border-collapse prose-table:border prose-table:border-border prose-table:rounded-lg prose-table:overflow-hidden',
          'prose-th:border prose-th:border-border prose-th:bg-accent-cyan/10 prose-th:p-3 prose-th:font-semibold prose-th:text-foreground',
          'prose-td:border prose-td:border-border prose-td:p-3 prose-td:text-foreground',
          // Horizontal rule styling
          'prose-hr:border-border prose-hr:my-6',
          // List styling improvements
          'prose-li:marker:text-foreground',
          // Better text contrast and readability
          'text-foreground leading-relaxed',
          // Layout and spacing
          `min-h-[${minHeight}] p-3 sm:p-4 lg:p-6`,
          'focus-within:ring-2 focus-within:ring-accent-cyan/30 focus-within:ring-offset-1',
          // Mode-specific adjustments
          mode === 'minimal' ? 'p-2 sm:p-3 lg:p-4 min-h-[100px] sm:min-h-[120px]' : '',
          mode === 'inline' ? 'p-2 sm:p-3 min-h-[50px] sm:min-h-[60px] border-0 bg-transparent focus-within:ring-0' : '',
          // Ensure text is always visible
          '[&_*]:text-inherit [&_p:empty]:min-h-[1.5em]',
          // Placeholder styling
          '[&.is-editor-empty_.ProseMirror]:before:text-muted-foreground [&.is-editor-empty_.ProseMirror]:before:float-left [&.is-editor-empty_.ProseMirror]:before:pointer-events-none [&.is-editor-empty_.ProseMirror]:before:h-0 [&.is-editor-empty_.ProseMirror]:before:content-[attr(data-placeholder)]',
        ),
      },
      handleClick: (view) => {
        // Ensure immediate focus on single click
        if (editable && !isPreviewMode) {
          view.focus();
          return true;
        }
        return false;
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

  const addLink = useCallback(() => {
    if (!editor) return;
    
    const url = window.prompt('Enter URL:');
    if (url) {
      try {
        editor.chain().focus().setLink({ href: url }).run();
      } catch (error) {
        console.error('Failed to add link:', error);
      }
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    
    const url = window.prompt('Enter image URL:');
    if (url) {
      try {
        editor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error('Failed to add image:', error);
      }
    }
  }, [editor]);

  const addTable = useCallback(() => {
    if (!editor) return;
    
    try {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    } catch (error) {
      console.error('Failed to add table:', error);
    }
  }, [editor]);

  const setTextAlign = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (!editor) return;
    
    try {
      editor.chain().focus().setTextAlign(alignment).run();
    } catch (error) {
      console.error('Failed to set text alignment:', error);
    }
  }, [editor]);

  const setTextColor = useCallback((color: string) => {
    if (!editor) return;
    
    try {
      editor.chain().focus().setColor(color).run();
      setShowColorPicker(false);
    } catch (error) {
      console.error('Failed to set text color:', error);
      setShowColorPicker(false);
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="w-full space-y-4">
        {showToolbar && mode !== 'inline' && (
          <div className="modern-card border-b-0 rounded-t-xl overflow-hidden">
            <div className="bg-gradient-to-r from-accent-cyan/5 via-accent-purple/5 to-accent-pink/5 p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        )}
        <div className="relative">
          <div className={cn(
            showToolbar && mode !== 'inline'
              ? 'modern-card border-t-0 rounded-t-none rounded-b-xl bg-gradient-to-br from-background via-background to-accent-cyan/5'
              : mode === 'inline'
                ? 'border-0 bg-transparent'
                : 'modern-card bg-gradient-to-br from-background via-background to-accent-purple/5',
            'shadow-sm',
            `min-h-[${minHeight}] p-3 sm:p-4 lg:p-6`,
            'flex items-center justify-center'
          )}>
            <div className="text-muted-foreground text-sm">Loading editor...</div>
          </div>
        </div>
      </div>
    );
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
      aria-label={title}
      className={cn(
        'h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 p-0 rounded-lg sm:rounded-xl',
        // Base styles
        'border border-transparent bg-transparent',
        // Focus styles
        'focus:ring-2 focus:ring-accent-cyan/40 focus:ring-offset-2 focus:ring-offset-background',
        'focus:border-accent-cyan/30',
        // Active state
        isActive ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30' : '',
        // Disabled state
        disabled ? 'opacity-40 cursor-not-allowed' : '',
        // Variant styles
        variant === 'color' ? 'h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9' : '',
      )}
    >
      {children}
    </Button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-8 bg-border mx-3" />
  );

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

  const { characters } = getCharacterCount();

  return (
    <div className="w-full space-y-4">
      {/* Enhanced Toolbar will replace bubble and floating menus */}

      {/* Modern Enhanced Toolbar */}
      {editable && showToolbar && mode !== 'inline' && (
        <div className="border border-border border-b-0 rounded-t-xl overflow-hidden bg-background">
          <div className="bg-muted/10 p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Essential Tools - Always visible */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-3 w-3 sm:h-4 sm:w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="h-3 w-3 sm:h-4 sm:w-4" />
              </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Core Text Formatting - Always visible */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-3 w-3 sm:h-4 sm:w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-3 w-3 sm:h-4 sm:w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
              >
                <Strikethrough className="h-3 w-3 sm:h-4 sm:w-4" />
              </ToolbarButton>
            </div>

            {/* Structure Tools - Hidden on mobile, visible on tablet+ */}
            <div className="hidden sm:flex items-center gap-1">
              <ToolbarDivider />
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
            </div>

            {/* Media & Links - Simplified on mobile */}
            <div className="flex items-center gap-1">
              <ToolbarDivider />
              <ToolbarButton
                onClick={addLink}
                isActive={editor.isActive('link')}
                title="Add Link"
              >
                <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </ToolbarButton>
              {currentConfig.showMediaTools && (
                <div className="hidden sm:flex items-center gap-1">
                  <ToolbarButton
                    onClick={addImage}
                    title="Add Image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </ToolbarButton>
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
                </div>
              )}
            </div>

            {/* Advanced Tools - Mode-aware and Responsive */}
            {currentConfig.showAdvancedTools && (
              <>
                <ToolbarDivider />
                <div className="flex items-center gap-1 relative">
                  {/* Mobile: Show more tools button */}
                  <div className="sm:hidden">
                    <ToolbarButton
                      onClick={() => setShowAdvancedTools(!showAdvancedTools)}
                      isActive={showAdvancedTools}
                      title="More Tools"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </ToolbarButton>
                  </div>

                  {/* Desktop: Show tools inline */}
                  <div className="hidden lg:flex items-center gap-1">
                    <ToolbarButton
                      onClick={() => editor.chain().focus().toggleCode().run()}
                      isActive={editor.isActive('code')}
                      title="Inline Code"
                    >
                      <Code className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      isActive={editor.isActive('blockquote')}
                      title="Quote"
                    >
                      <Quote className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={addTable}
                      title="Add Table"
                    >
                      <TableIcon className="h-4 w-4" />
                    </ToolbarButton>
                  </div>

                  {/* Tablet: Show more tools button */}
                  <div className="hidden sm:block lg:hidden">
                    <ToolbarButton
                      onClick={() => setShowAdvancedTools(!showAdvancedTools)}
                      isActive={showAdvancedTools}
                      title="More Tools"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </ToolbarButton>
                  </div>

                  {/* Mobile/Tablet Dropdown */}
                  {showAdvancedTools && (
                    <div className="absolute top-full left-0 mt-3 z-50 lg:hidden">
                      <div className="bg-background/95 backdrop-blur-sm p-3 sm:p-4 border border-border min-w-[200px] sm:min-w-[240px] rounded-xl">
                        <div className="space-y-3">
                          {/* Mobile: Include structure tools */}
                          <div className="sm:hidden space-y-3">
                            <div className="flex items-center gap-2">
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
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                isActive={editor.isActive('bulletList')}
                                title="Bullet List"
                              >
                                <List className="h-4 w-4" />
                              </ToolbarButton>
                            </div>
                            {currentConfig.showMediaTools && (
                              <div className="flex items-center gap-2">
                                <ToolbarButton
                                  onClick={addImage}
                                  title="Add Image"
                                >
                                  <ImageIcon className="h-4 w-4" />
                                </ToolbarButton>
                                <ToolbarButton
                                  onClick={() => fileInputRef.current?.click()}
                                  title="Upload Image"
                                >
                                  <Upload className="h-4 w-4" />
                                </ToolbarButton>
                              </div>
                            )}
                            <div className="w-full h-px bg-border" />
                          </div>

                          <div className="flex items-center gap-2">
                            <ToolbarButton
                              onClick={() => editor.chain().focus().toggleCode().run()}
                              isActive={editor.isActive('code')}
                              title="Inline Code"
                            >
                              <Code className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                              onClick={() => editor.chain().focus().toggleBlockquote().run()}
                              isActive={editor.isActive('blockquote')}
                              title="Quote"
                            >
                              <Quote className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                              onClick={addTable}
                              title="Add Table"
                            >
                              <TableIcon className="h-4 w-4" />
                            </ToolbarButton>
                          </div>

                          <div className="w-full h-px bg-gradient-to-r from-transparent via-accent-purple/30 to-transparent" />

                          <div className="flex items-center gap-2">
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

                          <div className="w-full h-px bg-gradient-to-r from-transparent via-accent-pink/30 to-transparent" />

                          <div className="flex items-center gap-2 relative">
                            <ToolbarButton
                              onClick={() => setShowColorPicker(!showColorPicker)}
                              title="Text Color"
                              variant="color"
                              isActive={showColorPicker}
                            >
                              <Palette className="h-4 w-4" />
                            </ToolbarButton>
                            {showColorPicker && (
                              <div ref={colorPickerRef} className="absolute top-full left-0 mt-2 z-50 modern-glass border border-border/50 backdrop-blur-md rounded-lg p-4 shadow-xl min-w-[240px] bg-background/95">
                                <div className="space-y-3">
                                  <div className="text-xs font-medium text-foreground mb-2">Text Colors</div>
                                  <div className="grid grid-cols-8 gap-2">
                                    {[
                                      // Neutral colors
                                      { color: '#000000', label: 'Black' },
                                      { color: '#374151', label: 'Gray 700' },
                                      { color: '#6B7280', label: 'Gray 500' },
                                      { color: '#9CA3AF', label: 'Gray 400' },
                                      { color: '#D1D5DB', label: 'Gray 300' },
                                      { color: '#F3F4F6', label: 'Gray 100' },
                                      { color: '#FFFFFF', label: 'White' },
                                      { color: 'hsl(var(--foreground))', label: 'Default' },
                                      // Theme accent colors
                                      { color: 'hsl(var(--accent-cyan))', label: 'Cyan' },
                                      { color: 'hsl(var(--accent-purple))', label: 'Purple' },
                                      { color: 'hsl(var(--accent-pink))', label: 'Pink' },
                                      { color: '#EF4444', label: 'Red' },
                                      { color: '#F97316', label: 'Orange' },
                                      { color: '#F59E0B', label: 'Amber' },
                                      { color: '#84CC16', label: 'Lime' },
                                      { color: '#22C55E', label: 'Green' },
                                      { color: '#10B981', label: 'Emerald' },
                                      { color: '#06B6D4', label: 'Cyan' },
                                      { color: '#0EA5E9', label: 'Sky' },
                                      { color: '#3B82F6', label: 'Blue' },
                                      { color: '#6366F1', label: 'Indigo' },
                                      { color: '#8B5CF6', label: 'Violet' },
                                      { color: '#A855F7', label: 'Purple' },
                                      { color: '#D946EF', label: 'Fuchsia' },
                                    ].map(({ color, label }) => (
                                      <button
                                        key={color}
                                        className="w-7 h-7 rounded-md border border-border focus:ring-2 focus:ring-accent-cyan/40 focus:ring-offset-1"
                                        style={{ backgroundColor: color }}
                                        onClick={() => setTextColor(color)}
                                        aria-label={label}
                                      />
                                    ))}
                                  </div>
                                  <div className="pt-2 border-t border-border/30">
                                    <button
                                      className="text-xs text-muted-foreground font-medium focus:ring-2 focus:ring-accent-cyan/40 focus:ring-offset-1 rounded px-2 py-1"
                                      onClick={() => {
                                        editor?.chain().focus().unsetColor().run();
                                        setShowColorPicker(false);
                                      }}
                                    >
                                      Remove Color
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            <ToolbarButton
                              onClick={() => editor.chain().focus().toggleHighlight().run()}
                              isActive={editor.isActive('highlight')}
                              title="Highlight"
                            >
                              <Highlighter className="h-4 w-4" />
                            </ToolbarButton>
                            <ToolbarButton
                              onClick={() => editor.chain().focus().setHorizontalRule().run()}
                              title="Horizontal Rule"
                            >
                              <Minus className="h-4 w-4" />
                            </ToolbarButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {currentConfig.showPreviewToggle && (
                  <ToolbarButton
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    isActive={isPreviewMode}
                    title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
                  >
                    {isPreviewMode ? <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </ToolbarButton>
                )}
              </>
            )}
          </div>

          {/* Status Bar */}
          {showCharacterCount && (
            <div className="px-4 py-2 border-t border-border/30 bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center gap-1",
                  isAtLimit() ? "text-destructive" : ""
                )}>
                  <span>Characters: {characters}</span>
                  {maxCharacters && <span>/ {maxCharacters}</span>}
                </div>
              </div>

              {isPreviewMode && (
                <div className="text-accent-cyan font-medium">
                  Preview Mode
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      )}

      {/* Enhanced Editor Content */}
      <div className="relative">
        <EditorContent
          editor={editor}
          onClick={() => {
            // Ensure immediate focus on any click within the editor area
            if (editor && editable && !isPreviewMode) {
              editor.commands.focus();
            }
          }}
          className={cn(
            editable && showToolbar && mode !== 'inline'
              ? 'border border-border border-t-0 rounded-t-none rounded-b-xl bg-background'
              : mode === 'inline'
                ? 'border-0 bg-transparent'
                : 'border border-border rounded-xl bg-background',
            isAtLimit() ? 'ring-2 ring-destructive/30 ring-offset-2' : '',
            // Add cursor pointer to indicate clickable area when editable
            editable && !isPreviewMode ? 'cursor-text' : ''
          )}
        />

        {/* Enhanced Character limit warning */}
        {isAtLimit() && maxCharacters && (
          <div className="absolute bottom-3 right-3 modern-glass bg-destructive/20 text-destructive text-xs px-3 py-2 rounded-lg border border-destructive/30 backdrop-blur-sm">
            <span className="font-medium">Character limit reached</span>
          </div>
        )}
      </div>

      {/* Mode-specific stats and info */}
      {mode === 'minimal' && showCharacterCount && (
        <div className="modern-glass px-3 py-2 rounded-lg mt-3 border border-white/10">
          <div className="flex items-center justify-between text-xs">
            <div className={cn(
              "flex items-center gap-2 font-medium",
              isAtLimit() ? "text-destructive" : "text-accent-cyan"
            )}>
              <span>Characters: {characters}</span>
              {maxCharacters && <span className="text-muted-foreground">/ {maxCharacters}</span>}
            </div>
            <div className="text-muted-foreground text-xs">
              Minimal Mode
            </div>
          </div>
        </div>
      )}

      {/* Inline mode - no stats, ultra-minimal */}
      {mode === 'inline' && (
        <div className="sr-only">
          Inline editor mode - {characters} characters
        </div>
      )}
    </div>
  );
};

export default TiptapEditor; 