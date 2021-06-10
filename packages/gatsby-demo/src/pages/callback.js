import React, { useEffect } from 'react';
import { navigate } from 'gatsby';
import { useOAuth2 } from 'keekijanai-react';

export default function Callback() {
  const auth = useOAuth2();

  useEffect(() => {
    setTimeout(() => {
      auth.onCallback(redirect => {
        navigate(redirect || '/');
      });
    }, 5000)
  }, []);

  return (
    <div>
      <h1>Redirect to last page after 5 seconds</h1>
    </div>
  )
}
