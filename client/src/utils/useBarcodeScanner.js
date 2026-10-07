import { useEffect, useRef } from 'react';

/**
 * Robust Hook for Hardware USB / Bluetooth Barcode Scanners
 * Physical barcode scanners act as high-speed keyboard input devices sending character bursts + Enter.
 */
export function useBarcodeScanner({ onScan, minLength = 3, maxInterval = 90 }) {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
      const isSearchInput = target.classList?.contains('pos-search-input');

      // Ignore pure navigation / modifier keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape'].includes(e.key)) {
        return;
      }

      const now = Date.now();
      const interval = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // When Enter / Carriage Return is received
      if (e.key === 'Enter' || e.keyCode === 13) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Sanitize code: remove control characters and trim
        let scannedCode = bufferRef.current.replace(/[\r\n\x00-\x1F\x7F]/g, '').trim();
        
        // If buffer was empty but search input has a value, use that
        if (!scannedCode && isSearchInput && target.value.trim()) {
          scannedCode = target.value.trim();
        }

        bufferRef.current = '';

        if (scannedCode.length >= minLength) {
          e.preventDefault();
          e.stopPropagation();
          onScan(scannedCode);
          return;
        }
      }

      // If user is actively typing slowly in a non-search modal form (like editing product name), don't intercept slow human typing
      if (isInput && !isSearchInput && interval > maxInterval) {
        bufferRef.current = '';
        return;
      }

      // If key is a printable character (digits, letters, symbols)
      if (e.key.length === 1) {
        // If slow typing occurred outside search, start fresh buffer with this key
        if (interval > maxInterval && !isSearchInput) {
          bufferRef.current = e.key;
        } else {
          bufferRef.current += e.key;
        }

        // Auto flush buffer if scanner doesn't send Enter (some scanner guns only send trailing pause)
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          // If a burst of 5+ characters arrived rapidly without Enter
          if (bufferRef.current.length >= 5 && interval <= maxInterval) {
            const potentialCode = bufferRef.current.replace(/[\r\n\x00-\x1F\x7F]/g, '').trim();
            bufferRef.current = '';
            if (potentialCode.length >= minLength) {
              onScan(potentialCode);
            }
          }
        }, 140);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onScan, minLength, maxInterval]);
}
