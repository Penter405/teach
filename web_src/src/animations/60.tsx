// Animation 60: one step = one action (code + call stack + variables)
import React from 'react';
import T from './trace/60';
import { TraceView } from '../animation_kit/AlgoKit';

export default function Anim60({ step }: { step: number }) {
  return <TraceView T={T} step={step} />;
}
