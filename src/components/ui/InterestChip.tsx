import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InterestChipProps {
  id: string;
  label: string;
  icon: string;
  selected: boolean;
  priority?: number;
  onToggle: (id: string) => void;
  onPriorityChange?: (id: string, priority: number) => void;
}

export function InterestChip({
  id,
  label,
  icon,
  selected,
  priority,
  onToggle,
}: InterestChipProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(id)}
      className={cn(
        'relative w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200',
        'text-left',
        selected
          ? 'bg-card ring-2 ring-primary shadow-card'
          : 'bg-card hover:shadow-soft'
      )}
      whileTap={{ scale: 0.97 }}
    >
      <span className="text-xl">{icon}</span>
      <span className={cn(
        'font-medium text-sm',
        selected ? 'text-foreground' : 'text-muted-foreground'
      )}>{label}</span>
      
      {/* Priority badge */}
      {selected && priority !== undefined && priority > 0 && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shadow-soft"
        >
          {priority}
        </motion.span>
      )}
    </motion.button>
  );
}
