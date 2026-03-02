import { InputHTMLAttributes, forwardRef, ReactNode, useId } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  error?: string
  description?: ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, description, className, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className={cn(
              'mt-1 h-4 w-4 rounded border border-gray-300',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          <div className="flex-1">
            {label != null && (
              <label htmlFor={inputId} className="text-sm font-medium text-gray-700 cursor-pointer">
                {label}
              </label>
            )}
            {description != null && (
              <p className="mt-0.5 text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
