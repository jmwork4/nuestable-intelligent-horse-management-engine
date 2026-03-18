import { useState } from 'react';
import { PageHeader, Card, CardTitle, Badge, Button, EmptyState } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';
import { cn, formatDate } from '@/lib/utils';
import { HandRaisedIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Proposal {
  id: string;
  horseName: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  deadline: string;
  options: { id: string; label: string; votes: number }[];
  totalVotes: number;
  totalEligible: number;
  userVote: string | null;
  status: 'open' | 'closed';
}

export default function SyndicateVoting() {
  const { user } = useAuthStore();

  // Placeholder - in production this comes from API
  const proposals: Proposal[] = [];

  return (
    <div>
      <PageHeader
        title="Syndicate Voting"
        subtitle="Vote on proposals for your horses"
        breadcrumbs={[
          { label: 'Owner Portal', href: '/owner-portal' },
          { label: 'Voting' },
        ]}
      />

      {proposals.length === 0 ? (
        <EmptyState
          icon={<HandRaisedIcon className="mx-auto h-12 w-12" />}
          title="No active proposals"
          message="When proposals are created for your syndicate horses, they will appear here for voting."
        />
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} userId={user?.id ?? ''} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProposalCard({ proposal, userId }: { proposal: Proposal; userId: string }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(proposal.userVote);
  const isOpen = proposal.status === 'open';
  const hasVoted = !!selectedOption;

  const handleVote = (optionId: string) => {
    if (!isOpen || hasVoted) return;
    setSelectedOption(optionId);
    // In production: call API to submit vote
  };

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <Badge color="brand" size="sm" className="mb-2">{proposal.horseName}</Badge>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{proposal.title}</h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{proposal.description}</p>
          <p className="mt-2 text-xs text-gray-400">
            Created by {proposal.createdBy} &middot; Deadline: {formatDate(proposal.deadline)}
          </p>
        </div>
        <Badge color={isOpen ? 'green' : 'gray'} size="sm">
          {isOpen ? 'OPEN' : 'CLOSED'}
        </Badge>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {proposal.options.map((option) => {
          const percentage = proposal.totalVotes > 0 ? (option.votes / proposal.totalVotes) * 100 : 0;
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!isOpen || hasVoted}
              className={cn(
                'relative w-full overflow-hidden rounded-lg border p-4 text-left transition-all min-h-touch',
                isSelected
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-700'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                (!isOpen || hasVoted) && !isSelected && 'opacity-60',
              )}
            >
              {/* Progress bar background */}
              {hasVoted && (
                <div
                  className="absolute inset-0 bg-brand-100/50 dark:bg-brand-900/20 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isSelected && <CheckIcon className="h-5 w-5 text-brand-600" />}
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{option.label}</span>
                </div>
                {hasVoted && (
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {percentage.toFixed(0)}% ({option.votes} votes)
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        {proposal.totalVotes} of {proposal.totalEligible} owners have voted
      </p>
    </Card>
  );
}
