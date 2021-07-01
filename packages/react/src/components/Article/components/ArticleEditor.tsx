import { EditorState } from "draft-js";
import { Editor, EditorContainer, toolbarRich } from "../../Editor";

interface ArticleEditorProps {
  editorState: EditorState;
  onEditorStateChange: (next: EditorState) => void;
  readMode?: boolean;
}

const toolbarRichPlugin = toolbarRich.createToolbarRichPlugin();
const { ToolbarRich } = toolbarRichPlugin;

export function ArticleEditor(props: ArticleEditorProps) {
  const {
    editorState,
    onEditorStateChange,
    readMode = false,
  } = props;
  
  return (
    <EditorContainer className="kkjn__article-editor-container">
      <Editor
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        readOnly={readMode}
        plugins={[...toolbarRichPlugin.dependPlugins, toolbarRichPlugin]}
      />
      {!readMode && <ToolbarRich />}
    </EditorContainer>
  )
}
