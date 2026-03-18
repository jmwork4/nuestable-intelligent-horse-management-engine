import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PencilIcon } from '@heroicons/react/24/outline';
import { PageHeader, Button, Tabs, LoadingSpinner, StatusBadge } from '@/components/ui';
import { useHorse } from '@/api/horses';
import { OverviewTab } from './tabs/OverviewTab';
import { RaceHistoryTab } from './tabs/RaceHistoryTab';
import { HealthTab } from './tabs/HealthTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { FinancialTab } from './tabs/FinancialTab';
import { MediaTab } from './tabs/MediaTab';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'races', label: 'Race History' },
  { key: 'health', label: 'Health' },
  { key: 'documents', label: 'Documents' },
  { key: 'financial', label: 'Financial' },
  { key: 'media', label: 'Media' },
];

export default function HorseProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: horse, isLoading } = useHorse(id);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!horse) {
    return (
      <div className="py-32 text-center">
        <p className="text-gray-500">Horse not found</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={horse.name}
        subtitle={horse.registeredName || undefined}
        breadcrumbs={[
          { label: 'Horses', href: '/horses' },
          { label: horse.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={horse.status} type="horse" size="lg" />
            <Button
              variant="secondary"
              icon={<PencilIcon className="h-4 w-4" />}
              onClick={() => navigate(`/horses/${id}/edit`)}
            >
              Edit
            </Button>
          </div>
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      <div>
        {activeTab === 'overview' && <OverviewTab horse={horse} />}
        {activeTab === 'races' && <RaceHistoryTab horseId={horse.id} />}
        {activeTab === 'health' && <HealthTab horseId={horse.id} />}
        {activeTab === 'documents' && <DocumentsTab horseId={horse.id} />}
        {activeTab === 'financial' && <FinancialTab horseId={horse.id} />}
        {activeTab === 'media' && <MediaTab horseId={horse.id} />}
      </div>
    </div>
  );
}
