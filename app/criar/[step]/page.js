import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Wizard from '../../../components/normal/Wizard';
import { steps } from '../../../lib/normal/categories';
export default function StepPage({params}) {if(!steps.includes(params.step))notFound();return <Suspense><Wizard step={params.step}/></Suspense>;}
