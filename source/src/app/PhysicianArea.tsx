import { Route, Routes } from 'react-router-dom';
import { PhysicianLayout } from '@/layouts/PhysicianLayout';
import { Dashboard } from '@/features/physician/Dashboard';
import { Patients } from '@/features/physician/Patients';
import { PatientDetail } from '@/features/physician/PatientDetail';
import { AppointmentsPage, PhysicianNotifications, ProgressQueue, SessionsQueue } from '@/features/physician/Queues';
import { ContentPage } from '@/features/physician/Content';
import { PhysicianSettings } from '@/features/physician/PhysicianSettings';
import { NotFound } from '@/features/public/NotFound';

export default function PhysicianArea() {
  return (
    <Routes>
      <Route element={<PhysicianLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="sessions" element={<SessionsQueue />} />
        <Route path="progress" element={<ProgressQueue />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="notifications" element={<PhysicianNotifications />} />
        <Route path="content" element={<ContentPage />} />
        <Route path="settings" element={<PhysicianSettings />} />
        <Route path="*" element={<NotFound to="/physician" dark={false} />} />
      </Route>
    </Routes>
  );
}
