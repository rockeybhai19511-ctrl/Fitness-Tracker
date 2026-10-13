import { motion } from "framer-motion";
import { LockKeyhole, Sparkles } from "lucide-react";

export type JourneyMilestone = {
  label: string;
  detail: string;
  threshold: number;
};

type Props = {
  current: number;
  milestones: JourneyMilestone[];
};

export default function JourneyTrail({ current, milestones }: Props) {
  return (
    <div className="journey-trail" aria-label="Progress milestones">
      {milestones.map((milestone, index) => {
        const unlocked = current >= milestone.threshold;
        return (
          <motion.div
            key={milestone.label}
            initial={false}
            animate={unlocked ? { y: [0, -3, 0] } : { y: 0 }}
            transition={{ delay: index * 0.045, duration: 0.38 }}
            className={`journey-stop ${unlocked ? "is-unlocked" : ""}`}
          >
            <span className="journey-stop__icon" aria-hidden="true">
              {unlocked ? <Sparkles size={14} /> : <LockKeyhole size={12} />}
            </span>
            <span className="journey-stop__text">
              <span className="journey-stop__label">{milestone.label}</span>
              <span className="journey-stop__detail">{unlocked ? "Unlocked" : milestone.detail}</span>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
