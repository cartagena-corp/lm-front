import { useRef, useEffect } from 'react';

type Props = {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   className?: string;
};

const AutoResizeTextarea = ({ value, onChange, placeholder, className = '' }: Props) => {
   const textareaRef = useRef<HTMLTextAreaElement>(null);

   useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
         textarea.style.height = 'auto';

         const scrollHeight = textarea.scrollHeight;
         const maxHeight = 112; // Tailwind's h-28 = 7rem = 112px

         textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
         textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      }
   }, [value]);

   return (
      <textarea
         ref={textareaRef}
         className={`w-full border border-black/15 rounded-md p-2 resize-none outline-none transition-all duration-150 max-h-28 overflow-y-auto ${className}`}
         placeholder={placeholder}
         value={value}
         rows={1}
         onChange={(e) => onChange(e.target.value)}
      />
   );
};

export default AutoResizeTextarea;
