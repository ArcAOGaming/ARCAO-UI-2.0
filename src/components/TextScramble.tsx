import React, { useEffect, useRef } from 'react';
import './TextScramble.css';

class TextScrambleEffect {
  el: HTMLElement;
  chars: string;
  queue: Array<{ from: string; to: string; start: number; end: number; char?: string }>;
  frameRequest: number;
  frame: number;
  resolve: ((value: void) => void) | null;

  constructor(el: HTMLElement) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.queue = [];
    this.frameRequest = 0;
    this.frame = 0;
    this.resolve = null;
    this.update = this.update.bind(this);
  }

  setText(newText: string) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => this.resolve = resolve);
    this.queue = [];
    
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length && this.resolve) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

interface TextScrambleProps {
  text: string;
  delay?: number;
}

const TextScramble: React.FC<TextScrambleProps> = ({ text, delay = 2000 }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<TextScrambleEffect | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      effectRef.current = new TextScrambleEffect(elementRef.current);
      
      const updateText = () => {
        if (effectRef.current) {
          effectRef.current.setText(text).then(() => {
            setTimeout(updateText, delay);
          });
        }
      };

      updateText();
    }

    return () => {
      if (effectRef.current) {
        cancelAnimationFrame(effectRef.current.frameRequest);
      }
    };
  }, [text, delay]);

  return <div className="text-scramble" ref={elementRef}>{text}</div>;
};

export default TextScramble;
