import { Modal } from './Modal';
import { Button } from './Button';
import { useI18n } from '@/services/i18n';

export function Confirm({ open, onClose, onConfirm, title, body, confirmLabel, danger, square, children }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; body?: string; confirmLabel: string; danger?: boolean; square?: boolean; children?: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" square={square}
      footer={<>
        <Button variant="ghost" square={square} onClick={onClose}>{t.a.cancel}</Button>
        <Button variant={danger ? 'danger' : 'primary'} square={square} onClick={onConfirm} data-autofocus data-testid="confirm-ok">{confirmLabel}</Button>
      </>}>
      {body && <p className="leading-relaxed text-stone-800">{body}</p>}
      {children}
    </Modal>
  );
}
