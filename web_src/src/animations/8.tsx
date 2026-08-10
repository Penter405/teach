// Animation 8: DataPipelineAnim
import React from 'react';
import { motion } from 'motion/react';
import { Box, AnimArrow } from './shared';

export default function Animation({ step }: { step: number }) {
  const stages = [
    { icon: '📡', label: 'Collect', color: 'cyan' },
    { icon: '💾', label: 'Store', color: 'purple' },
    { icon: '⚙️', label: 'Process', color: 'slate' },
    { icon: '🗑️', label: 'Clean', color: 'red' },
    { icon: '📤', label: 'Output', color: 'green' },
  ];
  return (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {stages.map((s, i) => (
        <React.Fragment key={i}>
          <Box active={step === i} color={s.color as any} className="min-w-[80px]"><span className="text-xl block mb-1">{s.icon}</span>{s.label}</Box>
          {i < stages.length - 1 && <AnimArrow active={step === i} />}
        </React.Fragment>
      ))}
    </div>
  );
}
