import React, { useEffect } from 'react';
import { useOAuth2 } from 'keekijanai-react';
import {
  useHistory
} from "react-router-dom";

export default function Callback() {
  const auth = useOAuth2();
  const history = useHistory();

  useEffect(() => {
    auth.onCallback(redirect => {
      history.push(redirect || '/');
    });
  }, []);

  return (
    <div>
      <h1>Redirect to last page after 5 seconds</h1>
    </div>
  )
}
