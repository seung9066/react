import React, { useEffect, useRef, useState } from 'react';
import '@css/RunawayButton.css';

import * as utils from '@utils';

const RunawayButton = ({ msg }) => {
  const buttonRef = useRef(null);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const button = buttonRef.current;
      if (!button) return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const rect = button.getBoundingClientRect();
      const buttonX = rect.left + rect.width / 2;
      const buttonY = rect.top + rect.height / 2;

      const dx = mouseX - buttonX;
      const dy = mouseY - buttonY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 150) {
        if (!moving) setMoving(true);
        const moveX = (dx / distance) * 120;
        const moveY = (dy / distance) * 120;
        button.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
      } else {
        if (moving) setMoving(false);
        button.style.transform = `translate(0, 0)`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [moving]);

  const handleClick = (e) => {
    if (moving) {
      utils.showToast(msg);
    }
  };

  return (
    <div className="runaway-container" onClick={handleClick}>
      <button type='button' ref={buttonRef} className={"button runaway-btn"} onClick={function() {alert("이걸 잡네 ㅋㅋ")}}>
        클릭
      </button>
    </div>
  );
};

export default RunawayButton;
