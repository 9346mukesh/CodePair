import Editor from '@monaco-editor/react'
import { useEffect, useMemo, useRef } from 'react'

function debounce(fn, wait) {
  let t = null
  return (...args) => {
    if (t) clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

export default function CodeEditor({
  value,
  onChange,
  onCursorMove,
  language = 'javascript',
  cursors = {},
  selfUserId,
  cursorLabelsById = {},
  activeGlow = true,
}) {
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const cursorDecorationsRef = useRef({})

  const debouncedChange = useMemo(
    () =>
      debounce((next, cursorPosition) => {
        onChange?.(next, cursorPosition)
      }, 50),
    [onChange],
  )

  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return

    const model = editor.getModel()
    if (!model) return

    const mkDeco = (userId, color, position) => {
      if (!position) return []
      const range = new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column,
      )
      const className = `remote-cursor remote-cursor-${userId}`
      const label = cursorLabelsById?.[userId]?.userName || cursorLabelsById?.[userId]?.name || userId
      const labelClass = `remote-cursor-label remote-cursor-label-${userId}`

      const styleId = `style-${userId}`
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = `
          .${className} { border-left: 2px solid ${color}; }
          .${labelClass} {
            background: rgba(15, 20, 27, 0.92);
            border: 1px solid ${color};
            color: #E6EDF3;
            padding: 1px 4px;
            border-radius: 6px;
            font-size: 10px;
            line-height: 1.2;
          }
        `
        document.head.appendChild(style)
      }

      return [
        {
          range,
          options: {
            className,
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            after: {
              content: `  ${label}`,
              inlineClassName: labelClass,
            },
          },
        },
      ]
    }

    const update = () => {
      Object.entries(cursors || {}).forEach(([userId, data]) => {
        if (userId === selfUserId) return
        const decos = mkDeco(userId, data.color || '#22c55e', data.position)
        const prev = cursorDecorationsRef.current[userId] || []
        cursorDecorationsRef.current[userId] = editor.deltaDecorations(prev, decos)
      })
    }

    update()
  }, [cursors, selfUserId, cursorLabelsById])

  return (
    <div
      className={[
        'h-full w-full overflow-hidden rounded-lg border border-border bg-[#0b0f14]',
        activeGlow ? 'shadow-accent-glow' : '',
      ].join(' ')}
    >
      <Editor
        height="100%"
        language={language}
        value={value}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontFamily: 'JetBrains Mono',
          fontSize: 14,
          lineHeight: 22,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          wordWrap: 'on',
          tabSize: 2,
          bracketPairColorization: { enabled: true },
          renderWhitespace: 'selection',
          renderLineHighlight: 'gutter',
          folding: true,
          breadcrumbs: { enabled: false },
          overviewRulerBorder: false,
        }}
        onMount={(editor, monaco) => {
          editorRef.current = editor
          monacoRef.current = monaco

          editor.onDidChangeCursorPosition((e) => {
            onCursorMove?.(e.position)
          })
        }}
        onChange={(next) => {
          const editor = editorRef.current
          const cursorPosition = editor?.getPosition?.() ?? null
          debouncedChange(next ?? '', cursorPosition)
        }}
      />
    </div>
  )
}

