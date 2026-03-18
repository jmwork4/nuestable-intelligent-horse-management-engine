import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
  error: <XCircleIcon className="h-5 w-5 text-red-500" />,
  warning: <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />,
  info: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
};

// Global toast state
let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((fn) => fn([...toasts]));
}

let counter = 0;

export function toast(type: ToastType, title: string, message?: string, duration = 5000) {
  const id = `toast-${++counter}`;
  const newToast: Toast = { id, type, title, message, duration };
  toasts = [...toasts, newToast];
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notifyListeners();
    }, duration);
  }

  return id;
}

toast.success = (title: string, message?: string) => toast('success', title, message);
toast.error = (title: string, message?: string) => toast('error', title, message);
toast.warning = (title: string, message?: string) => toast('warning', title, message);
toast.info = (title: string, message?: string) => toast('info', title, message);

export function ToastContainer() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setItems);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setItems);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-[100] flex flex-col gap-3 p-4 sm:p-6 max-w-md w-full">
      {items.map((item) => (
        <Transition
          key={item.id}
          show
          appear
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-2"
        >
          <div className="pointer-events-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5">{icons[item.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
                {item.message && (
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{item.message}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(item.id)}
                className="flex-shrink-0 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Transition>
      ))}
    </div>
  );
}
