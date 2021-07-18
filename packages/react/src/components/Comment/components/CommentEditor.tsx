import { EditorState } from "draft-js";
import { Editor, EditorContainer, toolbarRich } from "../../Editor";
import _ from 'lodash';
import { mergeStylesLeft, StylesProps } from "../../../util/style";

interface ArticleEditorProps extends StylesProps {
  editorState: EditorState;
  onEditorStateChange?: (next: EditorState) => void;
  readMode?: boolean;
  placeholder?: string;
}

const toolbarRichPlugin = toolbarRich.createToolbarRichPlugin();
const { ToolbarRich } = toolbarRichPlugin;

export default function CommentEditor(props: ArticleEditorProps) {
  const {
    editorState,
    onEditorStateChange,
    readMode = false,
    placeholder,
  } = props;
  
  return (
    <EditorContainer {...mergeStylesLeft("kkjn__comment-editor-container", undefined, props)}>
      <Editor
        editorState={editorState}
        onEditorStateChange={onEditorStateChange ?? _.noop}
        readOnly={readMode}
        plugins={[...toolbarRichPlugin.dependPlugins, toolbarRichPlugin]}
        placeholder={placeholder}
      />
      {!readMode && <ToolbarRich />}
    </EditorContainer>
  )
}
