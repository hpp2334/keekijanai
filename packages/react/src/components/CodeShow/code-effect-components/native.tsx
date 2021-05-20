import { useEffect } from "react";


export function NativeDemo(props: any) {
  const { html, handler } = props;

  useEffect(() => {
    handler();
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}