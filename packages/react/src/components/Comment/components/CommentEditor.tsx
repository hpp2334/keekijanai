import { EditorState } from "draft-js";
import { Editor, EditorContainer, toolbarRich, toolbar } from "../../Editor";
import _ from 'lodash';
import { mergeStylesLeft, StylesProps } from "../../../util/style";

import './CommentEditor.scss';
import { useMemo } from "react";

interface ArticleEditorProps extends StylesProps {
  editorState: EditorState;
  onEditorStateChange?: (next: EditorState) => void;
  readMode?: boolean;
  placeholder?: string;
}



export default function CommentEditor(props: ArticleEditorProps) {
  const {
    editorState,
    onEditorStateChange,
    readMode = false,
    placeholder,
  } = props;

  const {
    ToolbarRich,
    toolbarRichPlugin,
  } = useMemo(() => {
    const toolbarRichPlugin = toolbarRich.createToolbarRichPlugin();
    const { ToolbarRich } = toolbarRichPlugin;
    return {
      toolbarRichPlugin,
      ToolbarRich,
    }
  }, []);
  
  return (
    <EditorContainer {...mergeStylesLeft("kkjn__comment-editor-container", undefined, props)}>
      <Editor
        editorState={editorState}
        onEditorStateChange={onEditorStateChange ?? _.noop}
        readOnly={readMode}
        plugins={[...toolbarRichPlugin.dependPlugins, toolbarRichPlugin]}
        // plugins={[toolbarPlugin]}
        placeholder={placeholder}
      />
      {!readMode && <ToolbarRich />}
      {/* {!readMode && <Toolbar />} */}
    </EditorContainer>
  )
}
