// Animation 59: one step = one action (code + call stack + variables)
import React from 'react';
import T from './trace/59';
import { TraceView } from '../animation_kit/AlgoKit';

export default function Anim59({ step }: { step: number }) {
  return <TraceView T={T} step={step} />;
}
