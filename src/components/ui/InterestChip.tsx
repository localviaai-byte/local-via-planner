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
        'relative flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200',
        'font-medium text-sm',
        selected
          ? 'border-primary bg-terracotta-light text-foreground shadow-soft'
          : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
      {selected && priority !== undefined && priority > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-hero text-primary-foreground text-xs font-bold flex items-center justify-center shadow-card"
        >
          {priority}
        </motion.span>
      )}
    </motion.button>
  );
}
