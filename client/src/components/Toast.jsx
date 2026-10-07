import { useEffect } from 'react';
import { CloseIcon } from './icons.jsx';

// Thông báo lỗi nhỏ ở cuối màn hình, tự ẩn sau 5 giây
export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="toast" role="alert">
      <span>{message}</span>
      <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng thông báo">
        <CloseIcon />
      </button>
    </div>
  );
}
