import { Route, Routes } from 'react-router-dom';
import { PatientLayout } from '@/layouts/PatientLayout';
import { PatientHome } from '@/features/patient/PatientHome';
import { PatientPlan } from '@/features/patient/PatientPlan';
import { Walkthrough } from '@/features/patient/Walkthrough';
import { PatientSessions } from '@/features/patient/PatientSessions';
import { PatientReminders } from '@/features/patient/PatientReminders';
import { PatientProgress } from '@/features/patient/PatientProgress';
import { PatientSettings } from '@/features/patient/PatientSettings';
import { EducationIndex } from '@/features/education/EducationIndex';
import { ArticleView } from '@/features/education/ArticleView';
import { NotFound } from '@/features/public/NotFound';

export default function PatientArea() {
  return (
    <Routes>
      <Route element={<PatientLayout />}>
        <Route index element={<PatientHome />} />
        <Route path="plan" element={<PatientPlan />} />
        <Route path="walkthrough" element={<Walkthrough />} />
        <Route path="sessions" element={<PatientSessions />} />
        <Route path="reminders" element={<PatientReminders />} />
        <Route path="progress" element={<PatientProgress />} />
        <Route path="education" element={<EducationIndex mode="patient" />} />
        <Route path="education/:slug" element={<ArticleView mode="patient" />} />
        <Route path="settings" element={<PatientSettings />} />
        <Route path="*" element={<NotFound to="/patient" dark={false} />} />
      </Route>
    </Routes>
  );
}
