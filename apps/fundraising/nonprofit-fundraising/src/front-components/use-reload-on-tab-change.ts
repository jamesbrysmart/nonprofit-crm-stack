import { useEffect, useRef } from 'react';
import { useLocation } from 'twenty-sdk/front-component';

// Record page tabs stay mounted once opened, so a widget on an inactive tab
// misses changes made elsewhere. Switching tabs updates the route hash, so
// reload whenever it changes.
export const useReloadOnTabChange = (reload: () => void) => {
  const hash = useLocation()?.hash ?? '';
  const previousHash = useRef(hash);
  const latestReload = useRef(reload);

  latestReload.current = reload;

  useEffect(() => {
    if (previousHash.current === hash) {
      return;
    }

    previousHash.current = hash;
    latestReload.current();
  }, [hash]);
};
